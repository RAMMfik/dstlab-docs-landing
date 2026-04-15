-- CreateTable
CREATE TABLE "Tariff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "marketingTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "monthlyPriceRub" INTEGER,
    "yearlyPriceRub" INTEGER,
    "documentsLimit" INTEGER NOT NULL,
    "analysesLimit" INTEGER NOT NULL,
    "messagesLimit" INTEGER NOT NULL,
    "maxUploadSizeBytes" INTEGER NOT NULL,
    "priorityAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "teamsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "apiAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "billingPortal" BOOLEAN NOT NULL DEFAULT true,
    "storageDriver" TEXT NOT NULL DEFAULT 'local',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Tariff_code_key" ON "Tariff"("code");

-- CreateIndex
CREATE INDEX "Tariff_isActive_sortOrder_idx" ON "Tariff"("isActive", "sortOrder");
