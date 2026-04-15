import { getTariffByCode } from "@/lib/services/tariff.service";
import {
  getPlanConfig,
  normalizePlan,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";

export async function getUserFeatureAccess(user: {
  plan: string;
  subscriptionStatus: string;
}) {
  const plan = normalizePlan(user.plan);
  const subscriptionStatus = normalizeSubscriptionStatus(user.subscriptionStatus);

  const tariff = await getTariffByCode(plan);
  const fallbackConfig = getPlanConfig(plan);

  const planTitle = tariff?.title ?? fallbackConfig.title;

  const limits = tariff
    ? {
        documents: tariff.documentsLimit,
        analyses: tariff.analysesLimit,
        messages: tariff.messagesLimit,
        maxUploadSizeBytes: tariff.maxUploadSizeBytes,
      }
    : fallbackConfig.limits;

  const features = tariff
    ? {
        priorityAnalysis: tariff.priorityAnalysis,
        teams: tariff.teamsEnabled,
        apiAccess: tariff.apiAccessEnabled,
        billingPortal: tariff.billingPortal,
        storageDriver: tariff.storageDriver as "local" | "s3-ready",
      }
    : fallbackConfig.features;

  const isPaidPlan = plan !== "START";
  const isSubscriptionActive = subscriptionStatus === "ACTIVE";
  const hasPaidAccess = isPaidPlan && isSubscriptionActive;

  return {
    plan,
    planTitle,
    subscriptionStatus,
    isPro: plan === "PRO",
    isSubscriptionActive,
    hasPaidAccess,
    canUsePriorityAnalysis: features.priorityAnalysis && hasPaidAccess,
    canUseTeams: features.teams && hasPaidAccess,
    canUseApiAccess: features.apiAccess && hasPaidAccess,
    canUseBillingPortal: features.billingPortal,
    preferredStorageDriver: features.storageDriver,
    limits,
  };
}