-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL DEFAULT 'company',
    "meetingDateTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "meetingPurpose" TEXT NOT NULL,
    "objective" TEXT,
    "additionalContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastError" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "executiveSummary" TEXT,
    "findingsJson" TEXT,
    "implicationsJson" TEXT,
    "questionsJson" TEXT,
    "watchlistJson" TEXT,
    "wordCount" INTEGER DEFAULT 0,
    "qualityScore" DOUBLE PRECISION,
    "researchWindowStart" TIMESTAMP(3) NOT NULL,
    "researchWindowEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchRun" (
    "id" TEXT NOT NULL,
    "briefingId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "logsJson" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "ResearchRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "briefingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "publicationDate" TEXT,
    "extractedContent" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'news',
    "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "searchScore" DOUBLE PRECISION,
    "relevanceScore" DOUBLE PRECISION,
    "searchQuery" TEXT,
    "searchAngle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "briefingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "eventDate" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'uncertain',
    "confidenceLevel" TEXT NOT NULL DEFAULT 'low',
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimSource" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "ClaimSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Briefing_meetingId_idx" ON "Briefing"("meetingId");

-- CreateIndex
CREATE INDEX "Briefing_status_idx" ON "Briefing"("status");

-- CreateIndex
CREATE INDEX "ResearchRun_briefingId_idx" ON "ResearchRun"("briefingId");

-- CreateIndex
CREATE INDEX "Source_briefingId_idx" ON "Source"("briefingId");

-- CreateIndex
CREATE INDEX "Claim_briefingId_idx" ON "Claim"("briefingId");

-- CreateIndex
CREATE INDEX "Claim_verificationStatus_idx" ON "Claim"("verificationStatus");

-- CreateIndex
CREATE INDEX "ClaimSource_claimId_idx" ON "ClaimSource"("claimId");

-- CreateIndex
CREATE INDEX "ClaimSource_sourceId_idx" ON "ClaimSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimSource_claimId_sourceId_key" ON "ClaimSource"("claimId", "sourceId");

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchRun" ADD CONSTRAINT "ResearchRun_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSource" ADD CONSTRAINT "ClaimSource_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSource" ADD CONSTRAINT "ClaimSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
