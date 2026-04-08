import { getCurrentUser } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/api";
import { normalizePlan, normalizeSubscriptionStatus } from "@/lib/services/plan.service";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      response: unauthorized(),
    };
  }

  return {
    ok: true as const,
    user: {
      ...user,
      normalizedPlan: normalizePlan(user.plan),
      normalizedSubscriptionStatus: normalizeSubscriptionStatus(
        user.subscriptionStatus
      ),
    },
  };
}

export function requireActivePro(user: {
  plan: string;
  subscriptionStatus: string;
}) {
  const plan = normalizePlan(user.plan);
  const subscriptionStatus = normalizeSubscriptionStatus(user.subscriptionStatus);

  if (!(plan === "PRO" && subscriptionStatus === "ACTIVE")) {
    return {
      ok: false as const,
      response: forbidden("Для этого действия нужен активный тариф PRO"),
    };
  }

  return {
    ok: true as const,
  };
}