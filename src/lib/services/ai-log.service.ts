import { prisma } from "@/lib/prisma";

function normalizeErrorMessage(message: string) {
  return message.trim().slice(0, 1000);
}

export async function createAiUsageLog(params: {
  userId: string;
  documentId?: string | null;
  type: "ANALYSIS" | "CHAT";
  provider?: string;
  model?: string | null;
}) {
  return prisma.aiUsageLog.create({
    data: {
      userId: params.userId,
      documentId: params.documentId ?? null,
      type: params.type,
      provider: params.provider ?? "OPENROUTER",
      model: params.model ?? null,
      status: "STARTED",
    },
  });
}

export async function completeAiUsageLog(params: {
  logId: string;
  tokensInput?: number | null;
  tokensOutput?: number | null;
  tokensTotal?: number | null;
  estimatedCostUsd?: number | null;
  durationMs?: number | null;
  model?: string | null;
}) {
  return prisma.aiUsageLog.update({
    where: { id: params.logId },
    data: {
      status: "SUCCESS",
      model: params.model ?? undefined,
      tokensInput: params.tokensInput ?? null,
      tokensOutput: params.tokensOutput ?? null,
      tokensTotal: params.tokensTotal ?? null,
      estimatedCostUsd: params.estimatedCostUsd ?? null,
      durationMs: params.durationMs ?? null,
      errorMessage: null,
    },
  });
}

export async function failAiUsageLog(params: {
  logId: string;
  errorMessage: string;
  durationMs?: number | null;
}) {
  return prisma.aiUsageLog.update({
    where: { id: params.logId },
    data: {
      status: "FAILED",
      durationMs: params.durationMs ?? null,
      errorMessage: normalizeErrorMessage(params.errorMessage),
    },
  });
}