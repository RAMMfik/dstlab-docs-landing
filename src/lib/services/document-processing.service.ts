import fs from "node:fs/promises";
import path from "node:path";
import { parsePdf } from "@/lib/pdf";
import { parseDocx } from "@/lib/docx";
import { ensureDocumentFileExists } from "@/lib/services/storage.service";
import {
  markDocumentAnalysisFailed,
  markDocumentAnalysisStarted,
  saveDocumentAnalysis,
} from "@/lib/services/document.service";
import { runDocumentAnalysisDetailed } from "@/lib/services/ai.service";
import {
  createAiUsageLog,
  completeAiUsageLog,
  failAiUsageLog,
} from "@/lib/services/ai-log.service";
import { incrementAnalysesUsed } from "@/lib/services/usage.service";

const MIN_EXTRACTED_TEXT_LENGTH = 20;

async function readTextFile(fullPath: string) {
  return fs.readFile(fullPath, "utf-8");
}

export async function processDocumentAnalysis(params: {
  userId: string;
  documentId: string;
  fileUrl: string;
}) {
  let aiLogId: string | null = null;
  const startedAt = Date.now();

  try {
    await markDocumentAnalysisStarted(params.documentId);

    const aiLog = await createAiUsageLog({
      userId: params.userId,
      documentId: params.documentId,
      type: "ANALYSIS",
    });

    aiLogId = aiLog.id;

    const fullPath = await ensureDocumentFileExists(params.fileUrl);
    const ext = path.extname(fullPath).toLowerCase();

    let text = "";

    if (ext === ".pdf") {
      text = await parsePdf(fullPath);
    } else if (ext === ".txt") {
      text = await readTextFile(fullPath);
    } else if (ext === ".docx") {
      text = await parseDocx(fullPath);
    } else {
      throw new Error(
        `Формат ${ext || "unknown"} пока не поддерживается. Сейчас поддерживаются PDF, TXT и DOCX.`
      );
    }

    if (!text || text.trim().length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new Error(
        ext === ".txt"
          ? "TXT файл пустой или в нём слишком мало текста"
          : ext === ".docx"
            ? "Не удалось извлечь текст из DOCX"
            : "Не удалось извлечь текст из файла"
      );
    }

    const result = await runDocumentAnalysisDetailed(text);

    const updatedDocument = await saveDocumentAnalysis({
      documentId: params.documentId,
      extractedText: text,
      analysis: result.content,
    });

    await incrementAnalysesUsed(params.userId);

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

    return updatedDocument;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка анализа";

    try {
      await markDocumentAnalysisFailed({
        documentId: params.documentId,
        errorMessage: message,
      });
    } catch (markError) {
      console.error("[document-processing] failed to mark document as failed:", markError);
    }

    if (aiLogId) {
      try {
        await failAiUsageLog({
          logId: aiLogId,
          errorMessage: message,
          durationMs: Date.now() - startedAt,
        });
      } catch (logError) {
        console.error("[document-processing] failed to update ai log:", logError);
      }
    }

    throw error;
  }
}