import { prisma } from "@/lib/prisma";
import { getPlanTitle, normalizePlan } from "@/lib/services/plan.service";

type GetAdminUsersParams = {
  q?: string;
  plan?: string;
  subscriptionStatus?: string;
  sort?: string;
};

function getSubscriptionStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Активна";
    case "PAST_DUE":
      return "Проблема с оплатой";
    case "CANCELED":
      return "Отменена";
    case "EXPIRED":
      return "Истекла";
    default:
      return "Не активна";
  }
}

function getBillingProviderLabel(provider: string) {
  switch (provider) {
    case "ALFAPAY":
      return "AlfaPay";
    case "MANUAL":
      return "Ручное подключение";
    default:
      return "—";
  }
}

function getOrderBy(sort?: string) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "email_asc":
      return { email: "asc" as const };
    case "email_desc":
      return { email: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

export async function getAdminUsers(params: GetAdminUsersParams = {}) {
  const q = params.q?.trim() || "";
  const plan = params.plan?.trim() || "";
  const subscriptionStatus = params.subscriptionStatus?.trim() || "";
  const sort = params.sort?.trim() || "newest";

  const users = await prisma.user.findMany({
    where: {
      ...(q
        ? {
            email: {
              contains: q,
            },
          }
        : {}),
      ...(plan
        ? {
            plan: normalizePlan(plan),
          }
        : {}),
      ...(subscriptionStatus
        ? {
            subscriptionStatus,
          }
        : {}),
    },
    include: {
      usage: true,
      _count: {
        select: {
          documents: true,
          payments: true,
        },
      },
    },
    orderBy: getOrderBy(sort),
  });

  return users.map((user) => {
    const normalizedPlan = normalizePlan(user.plan);

    return {
      id: user.id,
      email: user.email,
      planCode: normalizedPlan,
      planLabel: getPlanTitle(normalizedPlan),
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStatusLabel: getSubscriptionStatusLabel(
        user.subscriptionStatus
      ),
      billingProvider: user.billingProvider,
      billingProviderLabel: getBillingProviderLabel(user.billingProvider),
      currentPeriodEnd: user.currentPeriodEnd,
      createdAt: user.createdAt,
      usage: {
        documentsUsed: user.usage?.documentsUsed ?? 0,
        analysesUsed: user.usage?.analysesUsed ?? 0,
        messagesUsed: user.usage?.messagesUsed ?? 0,
      },
      counts: {
        documents: user._count.documents,
        payments: user._count.payments,
      },
    };
  });
}

type ChangeUserPlanParams = {
  userId: string;
  planCode: string;
};

export async function changeUserPlan({
  userId,
  planCode,
}: ChangeUserPlanParams) {
  const normalizedPlan = normalizePlan(planCode);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      plan: normalizedPlan,
      subscriptionStatus:
        normalizedPlan === "PRO" ? "ACTIVE" : "INACTIVE",
      billingProvider:
        normalizedPlan === "PRO" ? "MANUAL" : "NONE",
      currentPeriodEnd:
        normalizedPlan === "PRO"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
    },
  });

  return {
    success: true,
  };
}