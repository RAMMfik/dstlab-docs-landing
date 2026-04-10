import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { ok, internalError } from "@/lib/api";
import { deactivateManualProSubscription } from "@/lib/services/billing.service";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    await requireAdminUser();

    const { userId } = await context.params;

    await deactivateManualProSubscription(userId);

    return ok({
      success: true,
      message: "Тариф Pro отключен вручную",
    });
  } catch (error) {
    return internalError(
      error instanceof Error ? error.message : "Не удалось отключить Pro"
    );
  }
}