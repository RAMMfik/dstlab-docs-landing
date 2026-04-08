import { prisma } from "@/lib/prisma";

export async function getAdminAiAnalytics() {
  const logs = await prisma.aiUsageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          email: true,
        },
      },
      document: {
        select: {
          name: true,
        },
      },
    },
  });

  const totals = logs.reduce(
    (acc, log) => {
      acc.totalRequests += 1;
      acc.totalTokens += log.tokensTotal ?? 0;
      acc.totalCostUsd += log.estimatedCostUsd ?? 0;

      if (log.status === "SUCCESS") {
        acc.successRequests += 1;
      }

      if (log.status === "FAILED") {
        acc.failedRequests += 1;
      }

      if (log.type === "ANALYSIS") {
        acc.analysisRequests += 1;
      }

      if (log.type === "CHAT") {
        acc.chatRequests += 1;
      }

      return acc;
    },
    {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      analysisRequests: 0,
      chatRequests: 0,
      totalTokens: 0,
      totalCostUsd: 0,
    }
  );

  return {
    totals: {
      ...totals,
      totalCostUsd: Number(totals.totalCostUsd.toFixed(6)),
    },
    recentLogs: logs.map((log) => ({
      id: log.id,
      type: log.type,
      status: log.status,
      model: log.model,
      userEmail: log.user.email,
      documentName: log.document?.name || "—",
      tokensTotal: log.tokensTotal,
      estimatedCostUsd: log.estimatedCostUsd,
      durationMs: log.durationMs,
      createdAt: log.createdAt,
      errorMessage: log.errorMessage,
    })),
  };
}