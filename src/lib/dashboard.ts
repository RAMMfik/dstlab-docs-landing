import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getUserLimits } from "@/lib/services/limit.service";
import { getUserUsage } from "@/lib/services/usage.service";
import {
  getPlanTitle,
  normalizePlan,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";
import { getUserFeatureAccess } from "@/lib/services/feature-access.service";

export async function getDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const normalizedPlan = normalizePlan(user.plan);
  const limits = getUserLimits(normalizedPlan);
  const usage = await getUserUsage(user.id);
  const featureAccess = getUserFeatureAccess({
    plan: normalizedPlan,
    subscriptionStatus: user.subscriptionStatus,
  });

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalDocuments = documents.length;
  const analyzedDocuments = documents.filter(
    (doc) => doc.processingStatus === "READY"
  ).length;
  const failedDocuments = documents.filter(
    (doc) => doc.processingStatus === "FAILED"
  ).length;
  const queuedDocuments = documents.filter(
    (doc) => doc.processingStatus === "QUEUED"
  ).length;
  const analyzingDocuments = documents.filter(
    (doc) => doc.processingStatus === "ANALYZING"
  ).length;
  const pendingDocuments = queuedDocuments + analyzingDocuments;
  const completionRate =
    totalDocuments > 0 ? Math.round((analyzedDocuments / totalDocuments) * 100) : 0;

  const recentDocuments = documents.slice(0, 5).map((doc) => ({
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    status:
      doc.processingStatus === "READY"
        ? "Проверен"
        : doc.processingStatus === "FAILED"
          ? "Ошибка"
          : doc.processingStatus === "ANALYZING"
            ? "Обработка"
            : doc.processingStatus === "QUEUED"
              ? "В очереди"
              : "Без анализа",
    analyzedAt: doc.analyzedAt,
    processingStatus: doc.processingStatus,
  }));

  const latestAiLogs = await prisma.aiUsageLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    stats: {
      totalDocuments,
      analyzedDocuments,
      failedDocuments,
      queuedDocuments,
      analyzingDocuments,
      pendingDocuments,
      completionRate,
    },
    recentDocuments,
    usage: {
      documentsUsed: usage.documentsUsed,
      documentsLimit: limits.documents,
      analysesUsed: usage.analysesUsed,
      analysesLimit: limits.analyses,
      chatMessagesUsed: usage.messagesUsed,
      chatMessagesLimit: limits.messages,
    },
    account: {
      plan: getPlanTitle(normalizedPlan),
      normalizedPlan,
      subscriptionStatus: normalizeSubscriptionStatus(user.subscriptionStatus),
      currentPeriodEnd: user.currentPeriodEnd,
      features: featureAccess,
    },
    aiLogs: latestAiLogs.map((log) => ({
      id: log.id,
      type: log.type,
      status: log.status,
      model: log.model,
      tokensTotal: log.tokensTotal,
      estimatedCostUsd: log.estimatedCostUsd,
      durationMs: log.durationMs,
      createdAt: log.createdAt,
    })),
    tariff: getPlanTitle(normalizedPlan),
  };
}