import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { assertUsageWithinLimit } from "@/lib/services/usage-guard.service";
import { getUserDocumentById } from "@/lib/services/document.service";
import { processDocumentAnalysis } from "@/lib/services/document-processing.service";
import { enqueueDocumentAnalysis } from "@/lib/services/document-analysis-queue.service";
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

    if (!document.fileUrl) {
      return badRequest("У документа отсутствует файл");
    }

    const enqueueResult = await enqueueDocumentAnalysis({
      userId: user.id,
      documentId: document.id,
    });

    if (enqueueResult.mode === "database") {
      return ok(
        {
          queued: true,
          jobId: enqueueResult.job?.id ?? null,
          documentId: document.id,
          processingStatus: "QUEUED",
        },
        202
      );
    }

    const updatedDocument = await processDocumentAnalysis({
      userId: user.id,
      documentId: document.id,
      fileUrl: document.fileUrl,
    });

    return ok({
      queued: false,
      result: updatedDocument.analysis,
      documentId: updatedDocument.id,
      processingStatus: updatedDocument.processingStatus,
      analysisCompletedAt: updatedDocument.analysisCompletedAt,
    });
  } catch (error) {
    console.error("[analyze] fatal error:", error);

    return internalError(
      error instanceof Error ? error.message : "Неизвестная ошибка анализа"
    );
  }
}