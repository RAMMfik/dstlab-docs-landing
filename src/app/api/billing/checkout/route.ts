import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createAlfaPayPaymentIntent,
  createBillingEvent,
  markPaymentPending,
} from "@/lib/services/billing.service";
import { registerAlfaPayOrder } from "@/lib/services/payment-gateway.service";

type CheckoutPlanCode = "PRO";
type CheckoutBillingCycle = "MONTHLY" | "YEARLY";

type CheckoutRequestBody = {
  planCode?: string;
  billingCycle?: string;
};

const PRICE_MAP: Record<
  CheckoutPlanCode,
  Record<CheckoutBillingCycle, number>
> = {
  PRO: {
    MONTHLY: 99000,
    YEARLY: 999000,
  },
};

function normalizePlanCode(value: string | undefined): CheckoutPlanCode | null {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "PRO") {
    return "PRO";
  }

  return null;
}

function normalizeBillingCycle(
  value: string | undefined
): CheckoutBillingCycle {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "YEARLY") {
    return "YEARLY";
  }

  return "MONTHLY";
}

function buildReturnUrl(params: { paymentId: string; orderNumber: string }) {
  const explicitUrl = process.env.APP_BILLING_RETURN_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  const baseUrl =
    explicitUrl || `${appUrl?.replace(/\/$/, "")}/dashboard/billing/return`;

  if (!baseUrl) {
    throw new Error("APP_BILLING_RETURN_URL or NEXT_PUBLIC_APP_URL is required");
  }

  const url = new URL(baseUrl);

  url.searchParams.set("paymentId", params.paymentId);
  url.searchParams.set("orderNumber", params.orderNumber);

  return url.toString();
}

function buildFailUrl(params: { paymentId: string; orderNumber: string }) {
  const explicitUrl = process.env.APP_BILLING_FAIL_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  const baseUrl =
    explicitUrl || `${appUrl?.replace(/\/$/, "")}/dashboard/billing/fail`;

  if (!baseUrl) {
    throw new Error("APP_BILLING_FAIL_URL or NEXT_PUBLIC_APP_URL is required");
  }

  const url = new URL(baseUrl);

  url.searchParams.set("paymentId", params.paymentId);
  url.searchParams.set("orderNumber", params.orderNumber);

  return url.toString();
}

function createIdempotencyKey(userId: string, planCode: string, billingCycle: string) {
  return `checkout-${userId}-${planCode}-${billingCycle}-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CheckoutRequestBody;

    const planCode = normalizePlanCode(body.planCode);
    const billingCycle = normalizeBillingCycle(body.billingCycle);

    if (!planCode) {
      return NextResponse.json(
        { success: false, message: "Invalid planCode" },
        { status: 400 }
      );
    }

    const amount = PRICE_MAP[planCode][billingCycle];

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid checkout amount" },
        { status: 400 }
      );
    }

    const idempotencyKey = createIdempotencyKey(user.id, planCode, billingCycle);

    const payment = await createAlfaPayPaymentIntent({
      userId: user.id,
      amount,
      currency: "RUB",
      currencyCodeNumeric: 810,
      planCode,
      billingCycle,
      idempotencyKey,
      gatewayProjectId: process.env.ALFAPAY_PROJECT_ID,
      description: `DocsAI ${planCode} ${billingCycle} subscription`,
      metadata: {
        userId: user.id,
        userEmail: user.email,
        planCode,
        billingCycle,
        source: "docsai_checkout",
      },
    });

    await createBillingEvent({
      provider: "ALFAPAY",
      paymentId: payment.id,
      eventType: "CHECKOUT_CREATED",
      orderNumber: payment.orderNumber,
      payload: {
        paymentId: payment.id,
        userId: user.id,
        planCode,
        billingCycle,
        amount,
      },
      processingStatus: "PROCESSED",
    });

    const gatewayResponse = await registerAlfaPayOrder({
  amount,
  return_url: buildReturnUrl({
    paymentId: payment.id,
    orderNumber: payment.orderNumber,
  }),
  fail_url: buildFailUrl({
    paymentId: payment.id,
    orderNumber: payment.orderNumber,
  }),
      description: payment.description ?? undefined,
      email: user.email,
      currency: 810,
      language: "ru",
      json_fields: {
        local_payment_id: payment.id,
        user_id: user.id,
        plan_code: planCode,
        billing_cycle: billingCycle,
      },
      idempotencyKey,
    });

    const updatedPayment = await markPaymentPending({
      paymentId: payment.id,
      gatewayOrderId: gatewayResponse.order_id,
      gatewayTraceId: gatewayResponse.trace_id,
      externalStatus: gatewayResponse.status,
      paymentUrl: gatewayResponse.payment_url,
    });

    await createBillingEvent({
      provider: "ALFAPAY",
      paymentId: updatedPayment.id,
      eventType: "CHECKOUT_REGISTERED_IN_GATEWAY",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId: gatewayResponse.order_id,
      traceId: gatewayResponse.trace_id,
      statusBefore: payment.status,
      statusAfter: updatedPayment.status,
      payload: gatewayResponse,
      processingStatus: "PROCESSED",
    });

    return NextResponse.json({
      success: true,
      paymentId: updatedPayment.id,
      orderNumber: updatedPayment.orderNumber,
      paymentUrl: gatewayResponse.payment_url,
      status: updatedPayment.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}