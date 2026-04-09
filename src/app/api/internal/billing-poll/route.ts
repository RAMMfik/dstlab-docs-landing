import { NextResponse } from "next/server";
import {
  activateSubscriptionFromPayment,
  createBillingEvent,
  getStalePendingPayments,
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

type PollResultItem = {
  paymentId: string;
  orderNumber: string;
  previousStatus: string;
  nextStatus: string;
  success: boolean;
  message?: string;
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

export async function POST(request: Request) {
  try {
    const internalSecret = process.env.INTERNAL_API_SECRET?.trim();
    const authorization = request.headers.get("authorization");

    if (!internalSecret || authorization !== `Bearer ${internalSecret}`) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payments = await getStalePendingPayments({
      minCreatedMinutesAgo: 1,
      maxAgeHours: 24,
      limit: 50,
    });

    const results: PollResultItem[] = [];

    for (const payment of payments) {
      try {
        if (isTerminalStatus(payment.status)) {
          results.push({
            paymentId: payment.id,
            orderNumber: payment.orderNumber,
            previousStatus: payment.status,
            nextStatus: payment.status,
            success: true,
            message: "Skipped terminal payment",
          });
          continue;
        }

        if (!payment.gatewayOrderId && !payment.orderNumber) {
          await createBillingEvent({
            provider: "ALFAPAY",
            paymentId: payment.id,
            eventType: "POLL_SKIPPED_MISSING_IDENTIFIERS",
            orderNumber: payment.orderNumber,
            statusBefore: payment.status,
            statusAfter: payment.status,
            payload: {
              paymentId: payment.id,
              reason: "Missing gateway identifiers",
            },
            processingStatus: "ERROR",
            errorMessage: "Missing gateway identifiers",
          });

          results.push({
            paymentId: payment.id,
            orderNumber: payment.orderNumber,
            previousStatus: payment.status,
            nextStatus: payment.status,
            success: false,
            message: "Missing gateway identifiers",
          });
          continue;
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
          eventType: "POLL_STATUS_SYNCED",
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

        results.push({
          paymentId: updatedPayment.id,
          orderNumber: updatedPayment.orderNumber,
          previousStatus: payment.status,
          nextStatus: updatedPayment.status,
          success: true,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to poll payment";

        await createBillingEvent({
          provider: "ALFAPAY",
          paymentId: payment.id,
          eventType: "POLL_STATUS_FAILED",
          orderNumber: payment.orderNumber,
          gatewayOrderId: payment.gatewayOrderId ?? undefined,
          statusBefore: payment.status,
          statusAfter: payment.status,
          payload: {
            paymentId: payment.id,
            message,
          },
          processingStatus: "ERROR",
          errorMessage: message,
        });

        results.push({
          paymentId: payment.id,
          orderNumber: payment.orderNumber,
          previousStatus: payment.status,
          nextStatus: payment.status,
          success: false,
          message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run billing poll";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}