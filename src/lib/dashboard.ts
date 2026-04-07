import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getUserLimits } from "@/lib/services/limit.service";
import { getUserUsage } from "@/lib/services/usage.service";

export async function getDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const limits = getUserLimits(user.plan);
  const usage = await getUserUsage(user.id);

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalDocuments = documents.length;
  const analyzedDocuments = documents.filter((doc) => doc.analysis !== null).length;
  const pendingDocuments = totalDocuments - analyzedDocuments;
  const completionRate =
    totalDocuments > 0 ? Math.round((analyzedDocuments / totalDocuments) * 100) : 0;

  const recentDocuments = documents.slice(0, 5).map((doc) => ({
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    status: doc.analysis ? "Проверен" : "Без анализа",
    analyzedAt: doc.analyzedAt,
  }));

  return {
    stats: {
      totalDocuments,
      analyzedDocuments,
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
    tariff: user.plan,
  };
}