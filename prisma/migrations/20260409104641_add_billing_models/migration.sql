-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'ALFAPAY',
    "type" TEXT NOT NULL DEFAULT 'PURCHASE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderNumber" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "gatewayOrderId" TEXT,
    "gatewayProjectId" TEXT,
    "gatewayTraceId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "currencyCodeNumeric" INTEGER DEFAULT 810,
    "planCode" TEXT,
    "billingCycle" TEXT,
    "description" TEXT,
    "externalStatus" TEXT,
    "externalActionCode" INTEGER,
    "externalStatusCode" INTEGER,
    "paymentUrl" TEXT,
    "paidAt" DATETIME,
    "refundedAt" DATETIME,
    "failedAt" DATETIME,
    "canceledAt" DATETIME,
    "metadataJson" TEXT,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillingEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'ALFAPAY',
    "eventType" TEXT NOT NULL,
    "statusBefore" TEXT,
    "statusAfter" TEXT,
    "gatewayOrderId" TEXT,
    "orderNumber" TEXT,
    "traceId" TEXT,
    "payloadJson" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT,
    CONSTRAINT "BillingEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'ALFAPAY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "bindingId" TEXT NOT NULL,
    "gatewayProjectId" TEXT,
    "cardBrand" TEXT,
    "cardLast4" TEXT,
    "cardExpMonth" TEXT,
    "cardExpYear" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderNumber_key" ON "Payment"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_gatewayOrderId_idx" ON "Payment"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "Payment_planCode_createdAt_idx" ON "Payment"("planCode", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_lastSyncedAt_idx" ON "Payment"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "BillingEvent_paymentId_createdAt_idx" ON "BillingEvent"("paymentId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingEvent_orderNumber_createdAt_idx" ON "BillingEvent"("orderNumber", "createdAt");

-- CreateIndex
CREATE INDEX "BillingEvent_gatewayOrderId_createdAt_idx" ON "BillingEvent"("gatewayOrderId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingEvent_processingStatus_createdAt_idx" ON "BillingEvent"("processingStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_bindingId_key" ON "PaymentMethod"("bindingId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_createdAt_idx" ON "PaymentMethod"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentMethod_status_createdAt_idx" ON "PaymentMethod"("status", "createdAt");
