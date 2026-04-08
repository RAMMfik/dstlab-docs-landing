-- CreateTable
CREATE TABLE "DocumentAnalysisJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "scheduledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    CONSTRAINT "DocumentAnalysisJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentAnalysisJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DocumentAnalysisJob_status_scheduledAt_idx" ON "DocumentAnalysisJob"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysisJob_documentId_createdAt_idx" ON "DocumentAnalysisJob"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysisJob_userId_createdAt_idx" ON "DocumentAnalysisJob"("userId", "createdAt");
