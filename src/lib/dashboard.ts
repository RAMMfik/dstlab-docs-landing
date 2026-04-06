import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LIMITS } from "@/lib/limits";
import { getUserLimits } from "@/lib/limits";

export async function getDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const limits = getUserLimits(user.plan);

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalDocuments = documents.length;

  const analyzedDocuments = documents.filter(
    (doc) => doc.analysis !== null
  ).length;

  const pendingDocuments = totalDocuments - analyzedDocuments;

  const recentDocuments = documents.slice(0, 5).map((doc) => ({
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    status: doc.analysis ? "Проверен" : "Без анализа",
    type: doc.type || "unknown",
  }));

  return {
    stats: {
      totalDocuments,
      analyzedDocuments,
      pendingDocuments,
    },
    recentDocuments,
    usage: {
      documentsUsed: totalDocuments,
      documentsLimit: limits.documents,
      analysesUsed: analyzedDocuments,
      analysesLimit: LIMITS.analyses,
      chatMessagesUsed: 0,
      chatMessagesLimit: LIMITS.chatMessages,
    },
    tariff: "user.plan,",
  };
}