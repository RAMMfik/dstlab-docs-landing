import {
  getPlanConfig,
  normalizePlan,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";

export function getUserFeatureAccess(user: {
  plan: string;
  subscriptionStatus: string;
}) {
  const plan = normalizePlan(user.plan);
  const subscriptionStatus = normalizeSubscriptionStatus(user.subscriptionStatus);
  const config = getPlanConfig(plan);

  const isPro = plan === "PRO";
  const isSubscriptionActive = subscriptionStatus === "ACTIVE";

  return {
    plan,
    subscriptionStatus,
    isPro,
    isSubscriptionActive,
    canUsePriorityAnalysis: config.features.priorityAnalysis && isPro,
    canUseTeams: config.features.teams && isPro && isSubscriptionActive,
    canUseApiAccess: config.features.apiAccess && isPro && isSubscriptionActive,
    canUseBillingPortal: config.features.billingPortal && isPro,
    preferredStorageDriver: config.features.storageDriver,
    limits: config.limits,
  };
}