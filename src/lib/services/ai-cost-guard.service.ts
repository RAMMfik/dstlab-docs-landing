import { prisma } from "@/lib/prisma";

export async function assertAiCostWithinLimit(params: {
  userId: string;
}) {
  const maxCost = Number(process.env.AI_MAX_COST_PER_USER || "0");

  if (!maxCost || maxCost <= 0) {
    return { ok: true as const };
  }

  const result = await prisma.aiUsageLog.aggregate({
    where: {
      userId: params.userId,
      status: "SUCCESS",
    },
    _sum: {
      estimatedCostUsd: true,
    },
  });

  const used = result._sum.estimatedCostUsd || 0;

  if (used >= maxCost) {
    return {
      ok: false as const,
      used,
      limit: maxCost,
      message: `Достигнут лимит AI-использования ($${maxCost}).`,
    };
  }

  return {
    ok: true as const,
    used,
    limit: maxCost,
  };
}