import { NextRequest } from "next/server";
import { chatWithDocumentDetailed } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { incrementMessagesUsed } from "@/lib/services/usage.service";
import { assertUsageWithinLimit } from "@/lib/services/usage-guard.service";
import { assertAiCostWithinLimit } from "@/lib/services/ai-cost-guard.service";
import {
  getUserDocumentWithMessages,
  saveDocumentChatMessages,
} from "@/lib/services/document.service";
import {
  createAiUsageLog,
  completeAiUsageLog,
  failAiUsageLog,
} from "@/lib/services/ai-log.service";
import {
  ok,
  unauthorized,
  badRequest,
  notFound,
  internalError,
  apiError,
} from "@/lib/api";

export const runtime = "nodejs";

const MAX_QUESTION_LENGTH = 4000;
const MIN_EXTRACTED_TEXT_LENGTH = 20;

export async function POST(req: NextRequest) {
  let aiLogId: string | null = null;
  const startedAt = Date.now();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const usageGuard = await assertUsageWithinLimit({
      userId: user.id,
      plan: user.plan,
      feature: "messages",
    });

    if (!usageGuard.ok) {
      return apiError(usageGuard.message, 403, "LIMIT_REACHED");
    }

    const costGuard = await assertAiCostWithinLimit({
      userId: user.id,
    });

    if (!costGuard.ok) {
      return apiError(costGuard.message, 403, "AI_COST_LIMIT");
    }

    const body = await req.json();

    const documentId = String(body?.documentId || "").trim();
    const question = String(body?.question || "").trim();

    if (!documentId) return badRequest("Нет documentId");
    if (!question) return badRequest("Введите вопрос");

    if (question.length > MAX_QUESTION_LENGTH) {
      return badRequest(`Максимум ${MAX_QUESTION_LENGTH} символов`);
    }

    const document = await getUserDocumentWithMessages(documentId, user.id);

    if (!document) {
      return notFound("Документ не найден");
    }

    if (
      !document.extractedText ||
      document.extractedText.length < MIN_EXTRACTED_TEXT_LENGTH
    ) {
      return badRequest("Сначала запусти анализ документа");
    }

    const history = document.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const log = await createAiUsageLog({
      userId: user.id,
      documentId: document.id,
      type: "CHAT",
    });

    aiLogId = log.id;

    const result = await chatWithDocumentDetailed({
      documentText: document.extractedText,
      question,
      history,
    });

    await saveDocumentChatMessages({
      documentId: document.id,
      question,
      answer: result.content,
    });

    await incrementMessagesUsed(user.id);

    await completeAiUsageLog({
      logId: aiLogId,
      model: result.meta.model,
      tokensInput: result.meta.tokensInput,
      tokensOutput: result.meta.tokensOutput,
      tokensTotal: result.meta.tokensTotal,
      estimatedCostUsd: result.meta.estimatedCostUsd,
      durationMs: Date.now() - startedAt,
    });

    return ok({ answer: result.content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка чата";

    if (aiLogId) {
      await failAiUsageLog({
        logId: aiLogId,
        errorMessage: message,
        durationMs: Date.now() - startedAt,
      });
    }

    return internalError(message);
  }
}