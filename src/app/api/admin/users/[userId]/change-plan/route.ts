import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { changeUserPlan } from "@/lib/services/admin-users.service";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  await requireAdminUser();

  try {
    const { userId } = await context.params;
    const body = await request.json();

    const planCode = String(body.planCode || "").trim();

    if (!planCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Не указан тариф",
        },
        { status: 400 }
      );
    }

    const result = await changeUserPlan({
      userId,
      planCode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("change-plan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Ошибка изменения тарифа",
      },
      { status: 500 }
    );
  }
}