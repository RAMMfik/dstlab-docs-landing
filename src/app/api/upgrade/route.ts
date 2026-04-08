import { getCurrentUser } from "@/lib/auth";
import { activateManualProSubscription } from "@/lib/services/billing.service";
import { ok, unauthorized, badRequest, internalError } from "@/lib/api";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    if (user.plan === "PRO" && user.subscriptionStatus === "ACTIVE") {
      return badRequest("У вас уже активирован тариф PRO");
    }

    const updatedUser = await activateManualProSubscription(user.id);

    return ok({
      success: true,
      plan: updatedUser.plan,
      subscriptionStatus: updatedUser.subscriptionStatus,
      billingProvider: updatedUser.billingProvider,
      currentPeriodEnd: updatedUser.currentPeriodEnd,
      mode: "manual-upgrade",
    });
  } catch (error) {
    console.error("POST /api/upgrade error:", error);
    return internalError("Не удалось обновить тариф");
  }
}