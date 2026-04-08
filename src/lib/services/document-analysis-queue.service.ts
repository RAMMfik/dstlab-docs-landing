import { prisma } from "@/lib/prisma";
import { processDocumentAnalysis } from "@/lib/services/document-processing.service";
import {
  createDocumentAnalysisJob,
  markDocumentAnalysisJobCompleted,
  markDocumentAnalysisJobFailed,
  markDocumentAnalysisJobStarted,
  markDocumentQueued,
  getPendingDocumentAnalysisJobs,
} from "@/lib/services/document.service";

function getAnalysisQueueMode() {
  const mode = (process.env.DOCUMENT_ANALYSIS_QUEUE_MODE || "inline").toLowerCase();
  return mode === "database" ? "database" : "inline";
}

export async function enqueueDocumentAnalysis(params: {
  userId: string;
  documentId: string;
}) {
  if (getAnalysisQueueMode() === "inline") {
    return {
      mode: "inline" as const,
      job: null,
    };
  }

  await markDocumentQueued(params.documentId);

  const job = await createDocumentAnalysisJob({
    userId: params.userId,
    documentId: params.documentId,
  });

  return {
    mode: "database" as const,
    job,
  };
}

export async function processQueuedDocumentAnalysisJobs(limit = 5) {
  const jobs = await getPendingDocumentAnalysisJobs(limit);
  const results: Array<{
    jobId: string;
    status: "SUCCESS" | "FAILED";
    documentId: string;
    error?: string;
  }> = [];

  for (const job of jobs) {
    try {
      await markDocumentAnalysisJobStarted(job.id);

      await processDocumentAnalysis({
        userId: job.userId,
        documentId: job.documentId,
        fileUrl: job.document.fileUrl,
      });

      await markDocumentAnalysisJobCompleted(job.id);

      results.push({
        jobId: job.id,
        status: "SUCCESS",
        documentId: job.documentId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Неизвестная ошибка queue processing";

      const freshJob = await prisma.documentAnalysisJob.findUnique({
        where: { id: job.id },
      });

      await markDocumentAnalysisJobFailed({
        jobId: job.id,
        errorMessage: message,
        attempts: freshJob?.attempts ?? 1,
        maxAttempts: freshJob?.maxAttempts ?? 3,
      });

      results.push({
        jobId: job.id,
        status: "FAILED",
        documentId: job.documentId,
        error: message,
      });
    }
  }

  return {
    processed: results.length,
    results,
  };
}