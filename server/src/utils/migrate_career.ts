import prisma from "./prisma"

async function runSafeCareerMigration() {
  console.log("Applying non-destructive PostgreSQL schema updates for Phase 6 AI Career Profile...")
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CareerProfile" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "targetRole" TEXT NOT NULL DEFAULT 'AI Engineer',
        "readinessScore" INTEGER NOT NULL DEFAULT 0,
        "breakdownJson" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CareerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "ResumeAnalysis" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "fileType" TEXT NOT NULL,
        "filePath" TEXT,
        "parsedData" JSONB NOT NULL,
        "aiAnalysis" JSONB NOT NULL,
        "resumeScore" INTEGER NOT NULL DEFAULT 75,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ResumeAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "ResumeAnalysis_userId_idx" ON "ResumeAnalysis"("userId");

      CREATE TABLE IF NOT EXISTS "UserSkill" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'TECHNICAL',
        "level" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
        "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
        "source" TEXT NOT NULL DEFAULT 'RESUME',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UserSkill_userId_name_key" ON "UserSkill"("userId", "name");
      CREATE INDEX IF NOT EXISTS "UserSkill_userId_idx" ON "UserSkill"("userId");

      CREATE TABLE IF NOT EXISTS "SkillGap" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "targetRole" TEXT NOT NULL,
        "skillName" TEXT NOT NULL,
        "currentLevel" TEXT NOT NULL DEFAULT 'Needs Improvement',
        "requiredLevel" TEXT NOT NULL DEFAULT 'Intermediate',
        "matchPercentage" INTEGER NOT NULL DEFAULT 40,
        "gapScore" INTEGER NOT NULL DEFAULT 60,
        "status" TEXT NOT NULL DEFAULT 'NEEDS_IMPROVEMENT',
        "whyItMatters" TEXT,
        "recommendedTopics" TEXT[],
        "estimatedEffort" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SkillGap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "SkillGap_userId_targetRole_idx" ON "SkillGap"("userId", "targetRole");

      CREATE TABLE IF NOT EXISTS "CareerRecommendation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "meta" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CareerRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "CareerRecommendation_userId_idx" ON "CareerRecommendation"("userId");
    `)
    console.log("✅ Phase 6 Career tables and indexes successfully created or verified in PostgreSQL!")
  } catch (err) {
    console.error("Career Migration error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

runSafeCareerMigration()
