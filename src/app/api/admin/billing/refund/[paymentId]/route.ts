import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  createBillingEvent,
  getPaymentById,
  markPaymentRefunded,
} from "@/lib/services/billing.service";
import { refundAlfaPayOrder } from "@/lib/services/payment-gateway.service";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    await requireAdminUser();

    const { paymentId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const amount =
      typeof body.amount === "number" && body.amount > 0
        ? body.amount
        : undefined;

    const payment = await getPaymentById(paymentId);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    if (payment.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: "Only PAID payments can be refunded",
        },
        { status: 400 }
      );
    }

    if (!payment.gatewayOrderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing gatewayOrderId",
        },
        { status: 400 }
      );
    }

    const gatewayResponse = await refundAlfaPayOrder({
      order_id: payment.gatewayOrderId,
      amount,
    });

    const updatedPayment = await markPaymentRefunded({
      paymentId: payment.id,
      gatewayOrderId: payment.gatewayOrderId,
      gatewayTraceId: gatewayResponse.trace_id,
      externalStatus: "refunded",
      externalStatusCode: null,
      externalActionCode: gatewayResponse.error_code ?? null,
      partially: Boolean(amount),
    });

    await createBillingEvent({
      provider: "ALFAPAY",
      paymentId: updatedPayment.id,
      eventType: "ADMIN_REFUND_EXECUTED",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId: updatedPayment.gatewayOrderId ?? undefined,
      traceId: gatewayResponse.trace_id,
      statusBefore: payment.status,
      statusAfter: updatedPayment.status,
      payload: gatewayResponse,
      processingStatus: "PROCESSED",
    });

    return NextResponse.json({
      success: true,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Refund failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}