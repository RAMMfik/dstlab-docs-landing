import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { assertUsageWithinLimit } from "@/lib/services/usage-guard.service";
import { assertAiCostWithinLimit } from "@/lib/services/ai-cost-guard.service";
import { getUserDocumentById } from "@/lib/services/document.service";
import { processDocumentAnalysis } from "@/lib/services/document-processing.service";
import { enqueueDocumentAnalysis } from "@/lib/services/document-analysis-queue.service";
import {
  createAiUsageLog,
  completeAiUsageLog,
  failAiUsageLog,
} from "@/lib/services/ai-log.service";
import {
  ok,
  unauthorized,
  notFound,
  badRequest,
  apiError,
  internalError,
} from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let aiLogId: string | null = null;
  const startedAt = Date.now();

  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const usageGuard = await assertUsageWithinLimit({
      userId: user.id,
      plan: user.plan,
      feature: "analyses",
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

    if (!documentId) return badRequest("Нет documentId");

    const document = await getUserDocumentById(documentId, user.id);
    if (!document) return notFound("Документ не найден");

    const log = await createAiUsageLog({
      userId: user.id,
      documentId: document.id,
      type: "ANALYSIS",
    });

    aiLogId = log.id;

    const enqueueResult = await enqueueDocumentAnalysis({
      userId: user.id,
      documentId: document.id,
    });

    if (enqueueResult.mode === "database") {
      return ok({ queued: true }, 202);
    }

    const updated = await processDocumentAnalysis({
      userId: user.id,
      documentId: document.id,
      fileUrl: document.fileUrl!,
    });

    await completeAiUsageLog({
      logId: aiLogId,
      durationMs: Date.now() - startedAt,
    });

    return ok({
      result: updated.analysis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка анализа";

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