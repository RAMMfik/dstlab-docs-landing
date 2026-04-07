import { prisma } from "@/lib/prisma";

export async function ensureUserUsage(userId: string) {
  const existingUsage = await prisma.usage.findUnique({
    where: { userId },
  });

  if (existingUsage) {
    return existingUsage;
  }

  return prisma.usage.create({
    data: {
      userId,
    },
  });
}

export async function getUserUsage(userId: string) {
  return ensureUserUsage(userId);
}

export async function incrementDocumentsUsed(userId: string) {
  await ensureUserUsage(userId);

  return prisma.usage.update({
    where: { userId },
    data: {
      documentsUsed: {
        increment: 1,
      },
    },
  });
}

export async function incrementAnalysesUsed(userId: string) {
  await ensureUserUsage(userId);

  return prisma.usage.update({
    where: { userId },
    data: {
      analysesUsed: {
        increment: 1,
      },
    },
  });
}

export async function incrementMessagesUsed(userId: string) {
  await ensureUserUsage(userId);

  return prisma.usage.update({
    where: { userId },
    data: {
      messagesUsed: {
        increment: 1,
      },
    },
  });
}