import { getUserFeatureAccess } from "@/lib/services/feature-access.service";

export function getSubscriptionGateMessage(user: {
  plan: string;
  subscriptionStatus: string;
}) {
  const access = getUserFeatureAccess(user);

  if (access.plan === "FREE") {
    return "Функция доступна на тарифе PRO.";
  }

  if (access.plan === "PRO" && !access.isSubscriptionActive) {
    return "Нужна активная подписка PRO.";
  }

  return "Доступ разрешён.";
}