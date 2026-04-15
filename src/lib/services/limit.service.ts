import { getTariffByCode } from "@/lib/services/tariff.service";
import {
  getPlanLimits,
  normalizePlan,
  type UserPlan,
} from "@/lib/services/plan.service";

export { normalizePlan, type UserPlan };

export async function getUserLimits(plan: string) {
  const normalizedPlan = normalizePlan(plan);
  const tariff = await getTariffByCode(normalizedPlan);

  if (!tariff) {
    return getPlanLimits(normalizedPlan);
  }

  return {
    documents: tariff.documentsLimit,
    analyses: tariff.analysesLimit,
    messages: tariff.messagesLimit,
    maxUploadSizeBytes: tariff.maxUploadSizeBytes,
  };
}