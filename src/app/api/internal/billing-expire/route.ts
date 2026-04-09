import { NextResponse } from "next/server";
import {
  createBillingEvent,
  getStalePendingPayments,
  markPaymentCanceled,
} from "@/lib/services/billing.service";

type ExpireResultItem = {
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
      minCreatedMinutesAgo: 20,
      maxAgeHours: 24,
      limit: 100,
    });

    const results: ExpireResultItem[] = [];

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

        const updatedPayment = await markPaymentCanceled({
          paymentId: payment.id,
          gatewayOrderId: payment.gatewayOrderId,
          gatewayTraceId: payment.gatewayTraceId,
          externalStatus: payment.externalStatus ?? "expired",
          externalStatusCode: payment.externalStatusCode,
          externalActionCode: payment.externalActionCode,
        });

        await createBillingEvent({
          provider: "ALFAPAY",
          paymentId: updatedPayment.id,
          eventType: "PAYMENT_EXPIRED_BY_TIMEOUT",
          orderNumber: updatedPayment.orderNumber,
          gatewayOrderId: updatedPayment.gatewayOrderId ?? undefined,
          traceId: updatedPayment.gatewayTraceId ?? undefined,
          statusBefore: payment.status,
          statusAfter: updatedPayment.status,
          payload: {
            paymentId: updatedPayment.id,
            expiredAfterMinutes: 20,
          },
          processingStatus: "PROCESSED",
        });

        results.push({
          paymentId: updatedPayment.id,
          orderNumber: updatedPayment.orderNumber,
          previousStatus: payment.status,
          nextStatus: updatedPayment.status,
          success: true,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to expire payment";

        await createBillingEvent({
          provider: "ALFAPAY",
          paymentId: payment.id,
          eventType: "PAYMENT_EXPIRE_FAILED",
          orderNumber: payment.orderNumber,
          gatewayOrderId: payment.gatewayOrderId ?? undefined,
          traceId: payment.gatewayTraceId ?? undefined,
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
      error instanceof Error ? error.message : "Failed to expire stale payments";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}