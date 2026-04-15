import { NextRequest, NextResponse } from "next/server";
import { syncDefaultTariffs } from "@/lib/services/tariff.service";

function getInternalSecret() {
  return process.env.INTERNAL_API_SECRET || "change_me_internal_secret";
}

type SyncedTariffDto = {
  code: string;
  title: string;
  monthlyPriceRub: number | null;
  yearlyPriceRub: number | null;
  isActive: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expected = `Bearer ${getInternalSecret()}`;

    if (authHeader !== expected) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    const tariffs = await syncDefaultTariffs();

    return NextResponse.json({
      success: true,
      synced: tariffs.length,
      tariffs: tariffs.map((tariff: SyncedTariffDto): SyncedTariffDto => ({
        code: tariff.code,
        title: tariff.title,
        monthlyPriceRub: tariff.monthlyPriceRub,
        yearlyPriceRub: tariff.yearlyPriceRub,
        isActive: tariff.isActive,
      })),
    });
  } catch (error) {
    console.error("tariffs-sync error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Tariffs sync failed",
      },
      { status: 500 }
    );
  }
}