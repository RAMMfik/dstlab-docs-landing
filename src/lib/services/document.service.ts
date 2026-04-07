import { prisma } from "@/lib/prisma";

export async function getUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function countUserDocuments(userId: string) {
  return prisma.document.count({
    where: { userId },
  });
}

export async function createDocument(data: {
  userId: string;
  name: string;
  fileUrl: string;
}) {
  return prisma.document.create({
    data,
  });
}

export async function getUserDocumentById(documentId: string, userId: string) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
  });
}

export async function countAnalyzedDocuments(userId: string) {
  return prisma.document.count({
    where: {
      userId,
      analysis: {
        not: null,
      },
    },
  });
}

export async function saveDocumentAnalysis(params: {
  documentId: string;
  extractedText: string;
  analysis: string;
}) {
  return prisma.document.update({
    where: { id: params.documentId },
    data: {
      extractedText: params.extractedText,
      analysis: params.analysis,
      analyzedAt: new Date(),
    },
  });
}