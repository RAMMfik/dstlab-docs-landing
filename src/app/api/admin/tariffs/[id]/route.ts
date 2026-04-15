import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { updateTariff } from "@/lib/services/admin-tariffs.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error("Некорректное число");
  }

  return parsed;
}

function parseRequiredNumber(value: unknown) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error("Некорректное число");
  }

  return parsed;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  await requireAdminUser();

  try {
    const { id } = await context.params;
    const body = await request.json();

    const tariff = await updateTariff({
      id,
      title: String(body.title ?? "").trim(),
      marketingTitle: String(body.marketingTitle ?? "").trim(),
      description: String(body.description ?? "").trim(),
      monthlyPriceRub: parseNullableNumber(body.monthlyPriceRub),
      yearlyPriceRub: parseNullableNumber(body.yearlyPriceRub),
      documentsLimit: parseRequiredNumber(body.documentsLimit),
      analysesLimit: parseRequiredNumber(body.analysesLimit),
      messagesLimit: parseRequiredNumber(body.messagesLimit),
      maxUploadSizeBytes: parseRequiredNumber(body.maxUploadSizeBytes),
      priorityAnalysis: Boolean(body.priorityAnalysis),
      billingPortal: Boolean(body.billingPortal),
      storageDriver: String(body.storageDriver ?? "local").trim() || "local",
      isActive: Boolean(body.isActive),
    });

    return NextResponse.json({
      success: true,
      tariff: {
        id: tariff.id,
        code: tariff.code,
        title: tariff.title,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Не удалось обновить тариф",
      },
      { status: 500 }
    );
  }
}