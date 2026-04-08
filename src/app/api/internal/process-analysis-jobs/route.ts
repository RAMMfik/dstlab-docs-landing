import { NextRequest } from "next/server";
import { processQueuedDocumentAnalysisJobs } from "@/lib/services/document-analysis-queue.service";
import { ok, forbidden, internalError } from "@/lib/api";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const incoming = req.headers.get("x-internal-job-key") || "";
  const expected = process.env.INTERNAL_JOB_SECRET || "";
  return Boolean(expected) && incoming === expected;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return forbidden("Недостаточно прав для запуска worker endpoint");
    }

    const result = await processQueuedDocumentAnalysisJobs(5);
    return ok(result);
  } catch (error) {
    console.error("[process-analysis-jobs] fatal error:", error);
    return internalError(
      error instanceof Error ? error.message : "Не удалось обработать queue jobs"
    );
  }
}