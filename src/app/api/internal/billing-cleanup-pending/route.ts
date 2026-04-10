import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const result = await prisma.payment.updateMany({
    where: {
      status: {
        in: ["PENDING", "AUTHORIZED"],
      },
    },
    data: {
      status: "CANCELED",
      externalStatus: "manual_cleanup_after_successful_rollout",
      canceledAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    cleaned: result.count,
  });
}