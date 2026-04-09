import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  activateSubscriptionFromPayment,
  createBillingEvent,
  getUserPaymentById,
  markPaymentAuthorized,
  markPaymentCanceled,
  markPaymentFailed,
  markPaymentPaid,
  markPaymentRefunded,
} from "@/lib/services/billing.service";
import {
  getAlfaPayOrderStatus,
  mapAlfaPayStatusToInternal,
} from "@/lib/services/payment-gateway.service";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

function isTerminalStatus(status: string) {
  return [
    "PAID",
    "FAILED",
    "CANCELED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ].includes(status);
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { paymentId } = await context.params;

    const payment = await getUserPaymentById(user.id, paymentId);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    if (isTerminalStatus(payment.status)) {
      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        isTerminal: true,
      });
    }

    if (!payment.gatewayOrderId && !payment.orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing gateway identifiers",
        },
        { status: 400 }
      );
    }

    const gatewayStatus = await getAlfaPayOrderStatus({
      order_id: payment.gatewayOrderId ?? undefined,
      order_number: payment.orderNumber,
    });

    const internalStatus = mapAlfaPayStatusToInternal(
      gatewayStatus.order_status
    );

    await createBillingEvent({
      provider: "ALFAPAY",
      paymentId: payment.id,
      eventType: "SYNC_STATUS_POLLED",
      orderNumber: payment.orderNumber,
      gatewayOrderId: payment.gatewayOrderId ?? undefined,
      traceId: gatewayStatus.trace_id,
      statusBefore: payment.status,
      statusAfter: internalStatus,
      payload: gatewayStatus,
      processingStatus: "PROCESSED",
    });

    let updatedPayment = payment;

    switch (internalStatus) {
      case "AUTHORIZED":
        updatedPayment = await markPaymentAuthorized({
          paymentId: payment.id,
          gatewayOrderId: payment.gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });
        break;

      case "PAID":
        updatedPayment = await markPaymentPaid({
          paymentId: payment.id,
          gatewayOrderId: payment.gatewayOrderId,
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
          gatewayOrderId: payment.gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });
        break;

      case "CANCELED":
        updatedPayment = await markPaymentCanceled({
          paymentId: payment.id,
          gatewayOrderId: payment.gatewayOrderId,
          gatewayTraceId: gatewayStatus.trace_id,
          externalStatus: gatewayStatus.order_status,
          externalStatusCode: gatewayStatus.order_status_code,
          externalActionCode: gatewayStatus.action_code,
        });
        break;

      case "REFUNDED":
        updatedPayment = await markPaymentRefunded({
          paymentId: payment.id,
          gatewayOrderId: payment.gatewayOrderId,
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

    return NextResponse.json({
      success: true,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      isTerminal: isTerminalStatus(updatedPayment.status),
      gateway: {
        status: gatewayStatus.order_status,
        statusCode: gatewayStatus.order_status_code,
        actionCode: gatewayStatus.action_code,
        clientMessage: gatewayStatus.client_message ?? null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to sync payment";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}