-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Runtime" AS ENUM ('PYODIDE', 'WEBR', 'BIOWASM');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AccessMode" AS ENUM ('FREE', 'PAID', 'SPLIT');

-- CreateEnum
CREATE TYPE "StepAccess" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'ABANDONED', 'REFUNDED', 'REVIEW');

-- CreateEnum
CREATE TYPE "EntitlementKind" AS ENUM ('PRO');

-- CreateEnum
CREATE TYPE "EntitlementSource" AS ENUM ('PAYMENT', 'MANUAL_GRANT');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "AiPool" AS ENUM ('FREE_MODEL', 'PAID_MODEL', 'EMBEDDING');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('LEARNER', 'MENTOR');

-- CreateEnum
CREATE TYPE "MessageSource" AS ENUM ('AI', 'REFUSAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SESSION_START', 'STEP_OPEN', 'HINT_SHOWN', 'MENTOR_REQUEST', 'MENTOR_THUMB', 'STEP_LEAVE', 'RESTORE', 'DEVICE_PROFILE', 'DOWNLOAD', 'SYNC_ERROR', 'SIGNIN_STARTED', 'SIGNIN_COMPLETED', 'PAYWALL_VIEWED', 'CHECKOUT_STARTED', 'BILLING_VERIFY_TAPPED', 'FEEDBACK_CLICKED');

-- CreateEnum
CREATE TYPE "ChunkSource" AS ENUM ('STEP_INSTRUCTIONS', 'CHECK_SUMMARY', 'ERROR_PATTERN', 'TOOL_DOC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "accessMode" "AccessMode" NOT NULL,
    "freeStepCount" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "access" "StepAccess" NOT NULL,
    "instructionsMd" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "runtime" "Runtime" NOT NULL,
    "tools" TEXT[],
    "checks" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepGuard" (
    "stepId" TEXT NOT NULL,
    "solutionPatterns" TEXT[],

    CONSTRAINT "StepGuard_pkey" PRIMARY KEY ("stepId")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "isSynthetic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepDataset" (
    "stepId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "mountPath" TEXT NOT NULL,

    CONSTRAINT "StepDataset_pkey" PRIMARY KEY ("stepId","datasetId")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "rung" INTEGER NOT NULL,
    "bodyMd" TEXT NOT NULL,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorPattern" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "matchRule" JSONB NOT NULL,
    "messageMd" TEXT NOT NULL,

    CONSTRAINT "ErrorPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolDoc" (
    "id" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "toolVersion" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,

    CONSTRAINT "ToolDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "durationDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "planId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'flutterwave',
    "gatewayTransactionId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "initializedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'flutterwave',
    "eventKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "amountMinor" INTEGER,
    "currency" TEXT,
    "gatewayStatus" TEXT,
    "paymentId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "EntitlementKind" NOT NULL DEFAULT 'PRO',
    "source" "EntitlementSource" NOT NULL,
    "paymentId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerStepProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepVersion" INTEGER NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "highestHintRung" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastFailedCheckKey" TEXT,
    "passedAt" TIMESTAMP(3),
    "revision" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "editorText" TEXT NOT NULL,
    "commandLog" JSONB NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepVersion" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "failedCheckKey" TEXT,
    "resultSummary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepVersion" INTEGER NOT NULL,
    "role" "MessageRole" NOT NULL,
    "source" "MessageSource",
    "pool" "AiPool",
    "content" TEXT NOT NULL,
    "citedChunkIds" TEXT[],
    "topSimilarity" DOUBLE PRECISION,
    "outOfScope" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "thumb" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HintQuota" (
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "aiCount" INTEGER NOT NULL DEFAULT 0,
    "callCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HintQuota_pkey" PRIMARY KEY ("userId","day")
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "day" DATE NOT NULL,
    "pool" "AiPool" NOT NULL,
    "calls" INTEGER NOT NULL DEFAULT 0,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("day","pool")
);

-- CreateTable
CREATE TABLE "LearnerEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "stepId" TEXT,
    "type" "EventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentChunk" (
    "id" TEXT NOT NULL,
    "sourceType" "ChunkSource" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "stepId" TEXT,
    "tool" TEXT,
    "ordinal" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "stepVersion" INTEGER,
    "embeddingModel" TEXT NOT NULL,
    "embedding" vector(768),
    "embeddedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "LoginCode_email_createdAt_idx" ON "LoginCode"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");

-- CreateIndex
CREATE INDEX "Step_caseStudyId_orderIndex_idx" ON "Step"("caseStudyId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Step_caseStudyId_slug_key" ON "Step"("caseStudyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_slug_key" ON "Dataset"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Hint_stepId_rung_key" ON "Hint"("stepId", "rung");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorPattern_stepId_key_key" ON "ErrorPattern"("stepId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ToolDoc_tool_toolVersion_sectionTitle_key" ON "ToolDoc"("tool", "toolVersion", "sectionTitle");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_initializedAt_idx" ON "Payment"("status", "initializedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_gatewayTransactionId_key" ON "Payment"("provider", "gatewayTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_provider_eventKey_key" ON "PaymentEvent"("provider", "eventKey");

-- CreateIndex
CREATE INDEX "Entitlement_userId_endsAt_idx" ON "Entitlement"("userId", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_paymentId_key" ON "Entitlement"("paymentId");

-- CreateIndex
CREATE INDEX "LearnerStepProgress_userId_idx" ON "LearnerStepProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerStepProgress_userId_stepId_key" ON "LearnerStepProgress"("userId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSnapshot_userId_stepId_key" ON "WorkspaceSnapshot"("userId", "stepId");

-- CreateIndex
CREATE INDEX "CheckAttempt_userId_stepId_createdAt_idx" ON "CheckAttempt"("userId", "stepId", "createdAt");

-- CreateIndex
CREATE INDEX "CheckAttempt_stepId_failedCheckKey_idx" ON "CheckAttempt"("stepId", "failedCheckKey");

-- CreateIndex
CREATE INDEX "MentorMessage_userId_stepId_createdAt_idx" ON "MentorMessage"("userId", "stepId", "createdAt");

-- CreateIndex
CREATE INDEX "MentorMessage_outOfScope_createdAt_idx" ON "MentorMessage"("outOfScope", "createdAt");

-- CreateIndex
CREATE INDEX "LearnerEvent_userId_createdAt_idx" ON "LearnerEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LearnerEvent_anonId_createdAt_idx" ON "LearnerEvent"("anonId", "createdAt");

-- CreateIndex
CREATE INDEX "LearnerEvent_stepId_type_idx" ON "LearnerEvent"("stepId", "type");

-- CreateIndex
CREATE INDEX "ContentChunk_stepId_idx" ON "ContentChunk"("stepId");

-- CreateIndex
CREATE INDEX "ContentChunk_tool_idx" ON "ContentChunk"("tool");

-- CreateIndex
CREATE UNIQUE INDEX "ContentChunk_sourceType_sourceId_ordinal_key" ON "ContentChunk"("sourceType", "sourceId", "ordinal");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepGuard" ADD CONSTRAINT "StepGuard_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepDataset" ADD CONSTRAINT "StepDataset_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepDataset" ADD CONSTRAINT "StepDataset_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorPattern" ADD CONSTRAINT "ErrorPattern_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerStepProgress" ADD CONSTRAINT "LearnerStepProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerStepProgress" ADD CONSTRAINT "LearnerStepProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSnapshot" ADD CONSTRAINT "WorkspaceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSnapshot" ADD CONSTRAINT "WorkspaceSnapshot_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckAttempt" ADD CONSTRAINT "CheckAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckAttempt" ADD CONSTRAINT "CheckAttempt_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorMessage" ADD CONSTRAINT "MentorMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorMessage" ADD CONSTRAINT "MentorMessage_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HintQuota" ADD CONSTRAINT "HintQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerEvent" ADD CONSTRAINT "LearnerEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerEvent" ADD CONSTRAINT "LearnerEvent_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentChunk" ADD CONSTRAINT "ContentChunk_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;
