import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { ok, internalError } from "@/lib/api";
import { activateManualProSubscription } from "@/lib/services/billing.service";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    await requireAdminUser();

    const { userId } = await context.params;

    await activateManualProSubscription(userId);

    return ok({
      success: true,
      message: "Тариф Pro активирован вручную",
    });
  } catch (error) {
    return internalError(
      error instanceof Error ? error.message : "Не удалось активировать Pro"
    );
  }
}