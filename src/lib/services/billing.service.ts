import { prisma } from "@/lib/prisma";

type BillingProvider = "NONE" | "MANUAL" | "ALFAPAY";
type SubscriptionStatus =
  | "INACTIVE"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";
type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "UNKNOWN";

type UserBillingInput = {
  plan: string;
  subscriptionStatus: string;
  billingProvider: string;
  currentPeriodEnd: Date | null;
};

type CreateAlfaPayPaymentIntentParams = {
  userId: string;
  amount: number;
  currency?: string;
  currencyCodeNumeric?: number;
  planCode: string;
  billingCycle?: string;
  description?: string;
  idempotencyKey: string;
  gatewayProjectId?: string;
  metadata?: Record<string, unknown>;
};

type MarkPaymentPaidParams = {
  paymentId: string;
  gatewayOrderId?: string | null;
  gatewayTraceId?: string | null;
  externalStatus?: string | null;
  externalStatusCode?: number | null;
  externalActionCode?: number | null;
  paymentUrl?: string | null;
};

type MarkPaymentFailedParams = {
  paymentId: string;
  gatewayOrderId?: string | null;
  gatewayTraceId?: string | null;
  externalStatus?: string | null;
  externalStatusCode?: number | null;
  externalActionCode?: number | null;
};

type MarkPaymentCanceledParams = {
  paymentId: string;
  gatewayOrderId?: string | null;
  gatewayTraceId?: string | null;
  externalStatus?: string | null;
  externalStatusCode?: number | null;
  externalActionCode?: number | null;
};

type MarkPaymentRefundedParams = {
  paymentId: string;
  gatewayOrderId?: string | null;
  gatewayTraceId?: string | null;
  externalStatus?: string | null;
  externalStatusCode?: number | null;
  externalActionCode?: number | null;
  partially?: boolean;
};

function normalizePlan(plan: string): string {
  const normalized = plan.trim().toUpperCase();

  if (normalized === "PRO") return "PRO";
  if (normalized === "FREE") return "FREE";

  return "FREE";
}

function normalizeSubscriptionStatus(status: string): SubscriptionStatus {
  const normalized = status.trim().toUpperCase();

  switch (normalized) {
    case "ACTIVE":
      return "ACTIVE";
    case "PAST_DUE":
      return "PAST_DUE";
    case "CANCELED":
      return "CANCELED";
    case "EXPIRED":
      return "EXPIRED";
    case "INACTIVE":
    default:
      return "INACTIVE";
  }
}

function normalizeBillingProvider(provider: string): BillingProvider {
  const normalized = provider.trim().toUpperCase();

  switch (normalized) {
    case "MANUAL":
      return "MANUAL";
    case "ALFAPAY":
      return "ALFAPAY";
    case "NONE":
    default:
      return "NONE";
  }
}

function normalizePaymentStatus(status: string): PaymentStatus {
  const normalized = status.trim().toUpperCase();

  switch (normalized) {
    case "PENDING":
      return "PENDING";
    case "AUTHORIZED":
      return "AUTHORIZED";
    case "PAID":
      return "PAID";
    case "FAILED":
      return "FAILED";
    case "CANCELED":
      return "CANCELED";
    case "REFUNDED":
      return "REFUNDED";
    case "PARTIALLY_REFUNDED":
      return "PARTIALLY_REFUNDED";
    case "UNKNOWN":
    default:
      return "UNKNOWN";
  }
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function buildOrderNumber(prefix: string) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  const random = Math.random().toString(36).slice(2, 8);

  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return "{}";
  }
}

export function getUserBillingSnapshot(user: UserBillingInput) {
  const plan = normalizePlan(user.plan);
  const subscriptionStatus = normalizeSubscriptionStatus(
    user.subscriptionStatus
  );
  const billingProvider = normalizeBillingProvider(user.billingProvider);

  return {
    plan,
    subscriptionStatus,
    billingProvider,
    currentPeriodEnd: user.currentPeriodEnd,
    isActive: plan === "PRO" && subscriptionStatus === "ACTIVE",
  };
}

export async function getUserPayments(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserPaymentById(userId: string, paymentId: string) {
  return prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId,
    },
  });
}

export async function getPaymentById(paymentId: string) {
  return prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });
}

export async function getPaymentByOrderNumber(orderNumber: string) {
  return prisma.payment.findUnique({
    where: { orderNumber },
  });
}

export async function getPaymentByGatewayOrderId(gatewayOrderId: string) {
  return prisma.payment.findFirst({
    where: { gatewayOrderId },
  });
}

export async function createAlfaPayPaymentIntent(
  params: CreateAlfaPayPaymentIntentParams
) {
  return prisma.payment.create({
    data: {
      userId: params.userId,
      provider: "ALFAPAY",
      type: "PURCHASE",
      status: "PENDING",
      orderNumber: buildOrderNumber("ALFAPAY"),
      idempotencyKey: params.idempotencyKey,
      gatewayProjectId: params.gatewayProjectId ?? null,
      amount: params.amount,
      currency: params.currency ?? "RUB",
      currencyCodeNumeric: params.currencyCodeNumeric ?? 810,
      planCode: normalizePlan(params.planCode),
      billingCycle: (params.billingCycle ?? "MONTHLY").toUpperCase(),
      description:
        params.description ??
        `AlfaPay ${normalizePlan(params.planCode)} subscription purchase`,
      metadataJson: safeJsonStringify(params.metadata),
    },
  });
}

export async function activateManualProSubscription(userId: string) {
  const currentPeriodEnd = addDays(new Date(), 30);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        plan: "PRO",
        subscriptionStatus: "ACTIVE",
        billingProvider: "MANUAL",
        currentPeriodEnd,
      },
    });

    await tx.billingEvent.create({
      data: {
        provider: "MANUAL",
        eventType: "MANUAL_SUBSCRIPTION_ACTIVATED",
        statusAfter: "ACTIVE",
        payloadJson: safeJsonStringify({
          userId,
          plan: "PRO",
          currentPeriodEnd: currentPeriodEnd.toISOString(),
        }),
        processingStatus: "PROCESSED",
        processedAt: new Date(),
      },
    });

    return user;
  });
}

export async function activateSubscriptionFromPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (normalizePaymentStatus(payment.status) !== "PAID") {
    throw new Error("Cannot activate subscription from unpaid payment");
  }

  const normalizedPlan = normalizePlan(payment.planCode ?? "FREE");
  const billingCycle = (payment.billingCycle ?? "MONTHLY").toUpperCase();
  const currentPeriodEnd =
    billingCycle === "YEARLY" ? addDays(new Date(), 365) : addDays(new Date(), 30);

  const user = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: payment.userId },
      data: {
        plan: normalizedPlan,
        subscriptionStatus: normalizedPlan === "PRO" ? "ACTIVE" : "INACTIVE",
        billingProvider: payment.provider,
        currentPeriodEnd: normalizedPlan === "PRO" ? currentPeriodEnd : null,
      },
    });

    await tx.billingEvent.create({
      data: {
        provider: payment.provider,
        paymentId: payment.id,
        eventType: "SUBSCRIPTION_ACTIVATED_FROM_PAYMENT",
        orderNumber: payment.orderNumber,
        gatewayOrderId: payment.gatewayOrderId,
        statusBefore: null,
        statusAfter: normalizedPlan === "PRO" ? "ACTIVE" : "INACTIVE",
        payloadJson: safeJsonStringify({
          userId: payment.userId,
          paymentId: payment.id,
          plan: normalizedPlan,
          billingCycle,
          currentPeriodEnd:
            normalizedPlan === "PRO" ? currentPeriodEnd.toISOString() : null,
        }),
        processingStatus: "PROCESSED",
        processedAt: new Date(),
      },
    });

    return updatedUser;
  });

  await closeUserStalePendingPaymentsAfterSuccess(payment.userId, payment.id);

  return user;
}

export async function markPaymentPending(params: {
  paymentId: string;
  gatewayOrderId?: string | null;
  gatewayTraceId?: string | null;
  externalStatus?: string | null;
  externalStatusCode?: number | null;
  externalActionCode?: number | null;
  paymentUrl?: string | null;
}) {
  return prisma.payment.update({
    where: { id: params.paymentId },
    data: {
      status: "PENDING",
      gatewayOrderId: params.gatewayOrderId ?? undefined,
      gatewayTraceId: params.gatewayTraceId ?? undefined,
      externalStatus: params.externalStatus ?? "pending",
      externalStatusCode: params.externalStatusCode ?? undefined,
      externalActionCode: params.externalActionCode ?? undefined,
      paymentUrl: params.paymentUrl ?? undefined,
      lastSyncedAt: new Date(),
    },
  });
}

export async function markPaymentAuthorized(params: {
  paymentId: string;
  gatewayOrderId?: string | null;
  gatewayTraceId?: string | null;
  externalStatus?: string | null;
  externalStatusCode?: number | null;
  externalActionCode?: number | null;
}) {
  return prisma.payment.update({
    where: { id: params.paymentId },
    data: {
      status: "AUTHORIZED",
      gatewayOrderId: params.gatewayOrderId ?? undefined,
      gatewayTraceId: params.gatewayTraceId ?? undefined,
      externalStatus: params.externalStatus ?? "hold",
      externalStatusCode: params.externalStatusCode ?? undefined,
      externalActionCode: params.externalActionCode ?? undefined,
      lastSyncedAt: new Date(),
    },
  });
}

export async function markPaymentPaid(params: MarkPaymentPaidParams) {
  const existingPayment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
  });

  if (!existingPayment) {
    throw new Error("Payment not found");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: params.paymentId },
    data: {
      status: "PAID",
      gatewayOrderId: params.gatewayOrderId ?? undefined,
      gatewayTraceId: params.gatewayTraceId ?? undefined,
      externalStatus: params.externalStatus ?? "paid",
      externalStatusCode: params.externalStatusCode ?? undefined,
      externalActionCode: params.externalActionCode ?? undefined,
      paymentUrl: params.paymentUrl ?? undefined,
      paidAt: existingPayment.paidAt ?? new Date(),
      failedAt: null,
      canceledAt: null,
      lastSyncedAt: new Date(),
    },
  });

  await prisma.billingEvent.create({
    data: {
      provider: updatedPayment.provider,
      paymentId: updatedPayment.id,
      eventType: "PAYMENT_MARKED_PAID",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId: updatedPayment.gatewayOrderId,
      traceId: updatedPayment.gatewayTraceId,
      statusBefore: existingPayment.status,
      statusAfter: "PAID",
      payloadJson: safeJsonStringify({
        paymentId: updatedPayment.id,
        externalStatus: updatedPayment.externalStatus,
        externalStatusCode: updatedPayment.externalStatusCode,
        externalActionCode: updatedPayment.externalActionCode,
      }),
      processingStatus: "PROCESSED",
      processedAt: new Date(),
    },
  });

  return updatedPayment;
}

export async function markPaymentFailed(params: MarkPaymentFailedParams) {
  const existingPayment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
  });

  if (!existingPayment) {
    throw new Error("Payment not found");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: params.paymentId },
    data: {
      status: "FAILED",
      gatewayOrderId: params.gatewayOrderId ?? undefined,
      gatewayTraceId: params.gatewayTraceId ?? undefined,
      externalStatus: params.externalStatus ?? "failed",
      externalStatusCode: params.externalStatusCode ?? undefined,
      externalActionCode: params.externalActionCode ?? undefined,
      failedAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });

  await prisma.billingEvent.create({
    data: {
      provider: updatedPayment.provider,
      paymentId: updatedPayment.id,
      eventType: "PAYMENT_MARKED_FAILED",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId: updatedPayment.gatewayOrderId,
      traceId: updatedPayment.gatewayTraceId,
      statusBefore: existingPayment.status,
      statusAfter: "FAILED",
      payloadJson: safeJsonStringify({
        paymentId: updatedPayment.id,
        externalStatus: updatedPayment.externalStatus,
        externalStatusCode: updatedPayment.externalStatusCode,
        externalActionCode: updatedPayment.externalActionCode,
      }),
      processingStatus: "PROCESSED",
      processedAt: new Date(),
    },
  });

  return updatedPayment;
}

export async function markPaymentCanceled(params: MarkPaymentCanceledParams) {
  const existingPayment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
  });

  if (!existingPayment) {
    throw new Error("Payment not found");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: params.paymentId },
    data: {
      status: "CANCELED",
      gatewayOrderId: params.gatewayOrderId ?? undefined,
      gatewayTraceId: params.gatewayTraceId ?? undefined,
      externalStatus: params.externalStatus ?? "cancelled",
      externalStatusCode: params.externalStatusCode ?? undefined,
      externalActionCode: params.externalActionCode ?? undefined,
      canceledAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });

  await prisma.billingEvent.create({
    data: {
      provider: updatedPayment.provider,
      paymentId: updatedPayment.id,
      eventType: "PAYMENT_MARKED_CANCELED",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId: updatedPayment.gatewayOrderId,
      traceId: updatedPayment.gatewayTraceId,
      statusBefore: existingPayment.status,
      statusAfter: "CANCELED",
      payloadJson: safeJsonStringify({
        paymentId: updatedPayment.id,
        externalStatus: updatedPayment.externalStatus,
        externalStatusCode: updatedPayment.externalStatusCode,
        externalActionCode: updatedPayment.externalActionCode,
      }),
      processingStatus: "PROCESSED",
      processedAt: new Date(),
    },
  });

  return updatedPayment;
}

export async function markPaymentRefunded(params: MarkPaymentRefundedParams) {
  const existingPayment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
  });

  if (!existingPayment) {
    throw new Error("Payment not found");
  }

  const nextStatus = params.partially ? "PARTIALLY_REFUNDED" : "REFUNDED";

  const updatedPayment = await prisma.payment.update({
    where: { id: params.paymentId },
    data: {
      status: nextStatus,
      gatewayOrderId: params.gatewayOrderId ?? undefined,
      gatewayTraceId: params.gatewayTraceId ?? undefined,
      externalStatus: params.externalStatus ?? "refunded",
      externalStatusCode: params.externalStatusCode ?? undefined,
      externalActionCode: params.externalActionCode ?? undefined,
      refundedAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });

  await prisma.billingEvent.create({
    data: {
      provider: updatedPayment.provider,
      paymentId: updatedPayment.id,
      eventType: "PAYMENT_MARKED_REFUNDED",
      orderNumber: updatedPayment.orderNumber,
      gatewayOrderId: updatedPayment.gatewayOrderId,
      traceId: updatedPayment.gatewayTraceId,
      statusBefore: existingPayment.status,
      statusAfter: nextStatus,
      payloadJson: safeJsonStringify({
        paymentId: updatedPayment.id,
        partial: Boolean(params.partially),
        externalStatus: updatedPayment.externalStatus,
        externalStatusCode: updatedPayment.externalStatusCode,
        externalActionCode: updatedPayment.externalActionCode,
      }),
      processingStatus: "PROCESSED",
      processedAt: new Date(),
    },
  });

  return updatedPayment;
}

export async function createBillingEvent(params: {
  provider?: string;
  eventType: string;
  paymentId?: string;
  orderNumber?: string;
  gatewayOrderId?: string;
  traceId?: string;
  statusBefore?: string;
  statusAfter?: string;
  payload: unknown;
  processingStatus?: string;
  errorMessage?: string | null;
}) {
  return prisma.billingEvent.create({
    data: {
      provider: params.provider ?? "ALFAPAY",
      eventType: params.eventType,
      paymentId: params.paymentId,
      orderNumber: params.orderNumber,
      gatewayOrderId: params.gatewayOrderId,
      traceId: params.traceId,
      statusBefore: params.statusBefore,
      statusAfter: params.statusAfter,
      payloadJson: safeJsonStringify(params.payload),
      processingStatus: params.processingStatus ?? "RECEIVED",
      errorMessage: params.errorMessage ?? null,
      processedAt:
        params.processingStatus === "PROCESSED" ? new Date() : null,
    },
  });
}

export async function getBillingEventsForPayment(paymentId: string) {
  return prisma.billingEvent.findMany({
    where: { paymentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStalePendingPayments(params?: {
  minCreatedMinutesAgo?: number;
  maxAgeHours?: number;
  limit?: number;
}) {
  const minCreatedMinutesAgo = params?.minCreatedMinutesAgo ?? 10;
  const maxAgeHours = params?.maxAgeHours ?? 24;
  const limit = params?.limit ?? 50;

  const now = Date.now();
  const createdBefore = new Date(now - minCreatedMinutesAgo * 60 * 1000);
  const createdAfter = new Date(now - maxAgeHours * 60 * 60 * 1000);

  return prisma.payment.findMany({
    where: {
      status: {
        in: ["PENDING", "AUTHORIZED"],
      },
      createdAt: {
        lte: createdBefore,
        gte: createdAfter,
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function closeUserStalePendingPaymentsAfterSuccess(
  userId: string,
  excludePaymentId: string
) {
  const stalePayments = await prisma.payment.findMany({
    where: {
      userId,
      id: {
        not: excludePaymentId,
      },
      status: {
        in: ["PENDING", "AUTHORIZED"],
      },
    },
  });

  if (!stalePayments.length) {
    return { closed: 0 };
  }

  const ids = stalePayments.map((p) => p.id);

  await prisma.payment.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      status: "CANCELED",
      externalStatus: "superseded_by_successful_payment",
      canceledAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });

  for (const payment of stalePayments) {
    await prisma.billingEvent.create({
      data: {
        provider: payment.provider,
        paymentId: payment.id,
        eventType: "PAYMENT_AUTO_CANCELED_AFTER_SUCCESS",
        orderNumber: payment.orderNumber,
        gatewayOrderId: payment.gatewayOrderId,
        traceId: payment.gatewayTraceId,
        statusBefore: payment.status,
        statusAfter: "CANCELED",
        payloadJson: safeJsonStringify({
          reason: "superseded_by_successful_payment",
          replacedByPaymentId: excludePaymentId,
        }),
        processingStatus: "PROCESSED",
        processedAt: new Date(),
      },
    });
  }

  return {
    closed: stalePayments.length,
  };
}