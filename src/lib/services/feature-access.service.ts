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
  const hasPaidAccess = isPro && isSubscriptionActive;

  return {
    plan,
    planTitle: config.title,
    subscriptionStatus,
    isPro,
    isSubscriptionActive,
    hasPaidAccess,
    canUsePriorityAnalysis: config.features.priorityAnalysis && hasPaidAccess,
    canUseTeams: config.features.teams && hasPaidAccess,
    canUseApiAccess: config.features.apiAccess && hasPaidAccess,
    canUseBillingPortal: config.features.billingPortal,
    preferredStorageDriver: config.features.storageDriver,
    limits: config.limits,
  };
}