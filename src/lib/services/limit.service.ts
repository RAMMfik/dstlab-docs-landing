import { getPlanLimits, normalizePlan, type UserPlan } from "@/lib/services/plan.service";

export { normalizePlan, type UserPlan };

export function getUserLimits(plan: string) {
  return getPlanLimits(plan);
}