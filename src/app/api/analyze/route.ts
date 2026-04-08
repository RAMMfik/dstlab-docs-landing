import { NextRequest } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { parsePdf } from "@/lib/pdf";
import { parseDocx } from "@/lib/docx";
import { getCurrentUser } from "@/lib/auth";
import { runDocumentAnalysisDetailed } from "@/lib/services/ai.service";
import { incrementAnalysesUsed } from "@/lib/services/usage.service";
import { assertUsageWithinLimit } from "@/lib/services/usage-guard.service";
import {
  getUserDocumentById,
  markDocumentAnalysisFailed,
  markDocumentAnalysisStarted,
  saveDocumentAnalysis,
} from "@/lib/services/document.service";
import { ensureDocumentFileExists } from "@/lib/services/storage.service";
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
  internalError,
  apiError,
} from "@/lib/api";

export const runtime = "nodejs";

const MIN_EXTRACTED_TEXT_LENGTH = 20;

async function readTextFile(fullPath: string) {
  return fs.readFile(fullPath, "utf-8");
}

export async function POST(req: NextRequest) {
  let documentIdForFailure: string | null = null;
  let aiLogId: string | null = null;
  const startedAt = Date.now();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const guard = await assertUsageWithinLimit({
      userId: user.id,
      plan: user.plan,
      feature: "analyses",
    });

    if (!guard.ok) {
      return apiError(guard.message, 403, "LIMIT_REACHED", {
        feature: guard.feature,
        used: guard.used,
        limit: guard.limit,
      });
    }

    const body = await req.json();
    const documentId = String(body?.documentId || "").trim();

    if (!documentId) {
      return badRequest("Нет documentId");
    }

    const document = await getUserDocumentById(documentId, user.id);

    if (!document) {
      return notFound("Документ не найден или недоступен");
    }

    documentIdForFailure = document.id;

    if (!document.fileUrl) {
      return badRequest("У документа отсутствует файл");
    }

    await markDocumentAnalysisStarted(document.id);

    const aiLog = await createAiUsageLog({
      userId: user.id,
      documentId: document.id,
      type: "ANALYSIS",
    });

    aiLogId = aiLog.id;

    let fullPath: string;

    try {
      fullPath = await ensureDocumentFileExists(document.fileUrl);
    } catch {
      throw new Error("Файл документа не найден на сервере");
    }

    const ext = path.extname(fullPath).toLowerCase();
    let text = "";

    if (ext === ".pdf") {
      text = await parsePdf(fullPath);
    } else if (ext === ".txt") {
      text = await readTextFile(fullPath);
    } else if (ext === ".docx") {
      text = await parseDocx(fullPath);
    } else {
      return badRequest(
        `Формат ${ext || "unknown"} пока не поддерживается. Сейчас поддерживаются PDF, TXT и DOCX.`,
        "UNSUPPORTED_FILE_TYPE"
      );
    }

    if (!text || text.trim().length < MIN_EXTRACTED_TEXT_LENGTH) {
      return badRequest(
        ext === ".txt"
          ? "TXT файл пустой или в нём слишком мало текста"
          : ext === ".docx"
            ? "Не удалось извлечь текст из DOCX"
            : "Не удалось извлечь текст из файла",
        "VALIDATION_ERROR"
      );
    }

    const result = await runDocumentAnalysisDetailed(text);

    const updatedDocument = await saveDocumentAnalysis({
      documentId: document.id,
      extractedText: text,
      analysis: result.content,
    });

    await incrementAnalysesUsed(user.id);

    if (aiLogId) {
      await completeAiUsageLog({
        logId: aiLogId,
        model: result.meta.model,
        tokensInput: result.meta.tokensInput,
        tokensOutput: result.meta.tokensOutput,
        tokensTotal: result.meta.tokensTotal,
        estimatedCostUsd: result.meta.estimatedCostUsd,
        durationMs: Date.now() - startedAt,
      });
    }

    return ok({
      result: result.content,
      documentId: updatedDocument.id,
      processingStatus: updatedDocument.processingStatus,
      analysisCompletedAt: updatedDocument.analysisCompletedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка анализа";

    if (documentIdForFailure) {
      try {
        await markDocumentAnalysisFailed({
          documentId: documentIdForFailure,
          errorMessage: message,
        });
      } catch (markError) {
        console.error("[analyze] failed to mark document as failed:", markError);
      }
    }

    if (aiLogId) {
      try {
        await failAiUsageLog({
          logId: aiLogId,
          errorMessage: message,
          durationMs: Date.now() - startedAt,
        });
      } catch (logError) {
        console.error("[analyze] failed to update ai log:", logError);
      }
    }

    console.error("[analyze] fatal error:", error);
    return internalError(message);
  }
}