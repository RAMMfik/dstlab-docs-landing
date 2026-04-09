/**
 * Reserved fallback webhook endpoint.
 * Current AlfaPay integration uses verify + polling flow as primary status sync model.
 * This route is kept for future gateway callback activation.
 */
import { NextResponse } from "next/server";
import {
  activateSubscriptionFromPayment,
  createBillingEvent,
  getPaymentByGatewayOrderId,
  getPaymentByOrderNumber,
  markPaymentAuthorized,
  markPaymentCanceled,
  markPaymentFailed,
  markPaymentPaid,
  markPaymentRefunded,
} from "@/lib/services/billing.service";
import { getAlfaPayOrderStatus, mapAlfaPayStatusToInternal } from "@/lib/services/payment-gateway.service";

type AlfaPayWebhookPayload = {
  mdOrder?: string;
  orderNumber?: string;
  operation?: string;
  status?: number;
};

function mapWebhookOperationToInternalStatus(operation?: string) {
  const normalized = operation?.trim().toLowerCase();

  switch (normalized) {
    case "deposited":
      return "PAID";
    case "approved":
      return "AUTHORIZED";
    case "declined":
      return "FAILED";
    case "reversed":
      return "CANCELED";
    case "refunded":
      return "REFUNDED";
    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AlfaPayWebhookPayload;

    const gatewayOrderId = body.mdOrder;
    const orderNumber = body.orderNumber;

    if (!gatewayOrderId && !orderNumber) {
      return NextResponse.json(
        { success: false, message: "Missing payment identifiers" },
        { status: 400 }
      );
    }

    let payment = null;

    if (gatewayOrderId) {
      payment = await getPaymentByGatewayOrderId(gatewayOrderId);
    }

    if (!payment && orderNumber) {
      payment = await getPaymentByOrderNumber(orderNumber);
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    await createBillingEvent({
      provider: "ALFAPAY",
      paymentId: payment.id,
      eventType: "WEBHOOK_RECEIVED",
      orderNumber: payment.orderNumber,
      gatewayOrderId,
      payload: body,
      processingStatus: "PROCESSED",
    });

    let internalStatus = mapWebhookOperationToInternalStatus(body.operation);

    // всегда сверяем через gateway status API — webhook сам по себе не trusted source
    const gatewayStatus = await getAlfaPayOrderStatus({
      order_id: gatewayOrderId ?? undefined,
      order_number: orderNumber ?? undefined,
    });

    internalStatus = mapAlfaPayStatusToInternal(gatewayStatus.order_status);

    let updatedPayment = payment;

    switch (internalStatus) {
      case "AUTHORIZED":
        updatedPayment = await markPaymentAuthorized({
          paymentId: payment.id,
          gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });
        break;

      case "PAID":
        updatedPayment = await markPaymentPaid({
          paymentId: payment.id,
          gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });

        await activateSubscriptionFromPayment(payment.id);
        break;

      case "FAILED":
        updatedPayment = await markPaymentFailed({
          paymentId: payment.id,
          gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });
        break;

      case "CANCELED":
        updatedPayment = await markPaymentCanceled({
          paymentId: payment.id,
          gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });
        break;

      case "REFUNDED":
        updatedPayment = await markPaymentRefunded({
          paymentId: payment.id,
          gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
          partially: false,
        });
        break;

      default:
        break;
    }

    await createBillingEvent({
      provider: "ALFAPAY",
      paymentId: updatedPayment.id,
      eventType: "WEBHOOK_PROCESSED",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId,
      traceId: gatewayStatus.trace_id,
      statusBefore: payment.status,
      statusAfter: updatedPayment.status,
      payload: gatewayStatus,
      processingStatus: "PROCESSED",
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}