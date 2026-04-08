import { prisma } from "@/lib/prisma";
import {
  normalizeBillingProvider,
  normalizePlan,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";

export function getUserBillingSnapshot(user: {
  plan: string;
  subscriptionStatus: string;
  billingProvider: string;
  currentPeriodEnd: Date | null;
}) {
  return {
    plan: normalizePlan(user.plan),
    subscriptionStatus: normalizeSubscriptionStatus(user.subscriptionStatus),
    billingProvider: normalizeBillingProvider(user.billingProvider),
    currentPeriodEnd: user.currentPeriodEnd,
    isActive:
      normalizePlan(user.plan) === "PRO" &&
      normalizeSubscriptionStatus(user.subscriptionStatus) === "ACTIVE",
  };
}

export async function activateManualProSubscription(userId: string) {
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

  return prisma.user.update({
    where: { id: userId },
    data: {
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
      billingProvider: "MANUAL",
      currentPeriodEnd,
    },
  });
}