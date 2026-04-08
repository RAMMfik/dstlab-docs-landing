import { prisma } from "@/lib/prisma";

function normalizeProcessingError(message: string) {
  return message.trim().slice(0, 1000);
}

export async function getUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDocument(data: {
  userId: string;
  name: string;
  fileUrl: string;
}) {
  return prisma.document.create({
    data: {
      ...data,
      processingStatus: "UPLOADED",
      processingError: null,
      analysisStartedAt: null,
      analysisCompletedAt: null,
    },
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

export async function getUserDocumentWithMessages(
  documentId: string,
  userId: string
) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function markDocumentQueued(documentId: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      processingStatus: "QUEUED",
      processingError: null,
    },
  });
}

export async function markDocumentAnalysisStarted(documentId: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      processingStatus: "ANALYZING",
      processingError: null,
      analysisStartedAt: new Date(),
    },
  });
}

export async function saveDocumentAnalysis(params: {
  documentId: string;
  extractedText: string;
  analysis: string;
}) {
  const now = new Date();

  return prisma.document.update({
    where: { id: params.documentId },
    data: {
      extractedText: params.extractedText,
      analysis: params.analysis,
      analyzedAt: now,
      processingStatus: "READY",
      processingError: null,
      analysisCompletedAt: now,
    },
  });
}

export async function markDocumentAnalysisFailed(params: {
  documentId: string;
  errorMessage: string;
}) {
  return prisma.document.update({
    where: { id: params.documentId },
    data: {
      processingStatus: "FAILED",
      processingError: normalizeProcessingError(params.errorMessage),
      analysisCompletedAt: new Date(),
    },
  });
}

export async function saveDocumentChatMessages(params: {
  documentId: string;
  question: string;
  answer: string;
}) {
  return prisma.documentMessage.createMany({
    data: [
      {
        documentId: params.documentId,
        role: "user",
        content: params.question,
      },
      {
        documentId: params.documentId,
        role: "assistant",
        content: params.answer,
      },
    ],
  });
}

export async function renameDocument(params: {
  documentId: string;
  userId: string;
  name: string;
}) {
  return prisma.document.updateMany({
    where: {
      id: params.documentId,
      userId: params.userId,
    },
    data: {
      name: params.name,
    },
  });
}

export async function deleteDocument(params: {
  documentId: string;
  userId: string;
}) {
  return prisma.document.deleteMany({
    where: {
      id: params.documentId,
      userId: params.userId,
    },
  });
}