import prisma from "./prisma"

async function runSafeMigration() {
  console.log("Applying non-destructive PostgreSQL schema updates for Phase 5 Certificate...")
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "certificateCode" TEXT;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "roadmapScore" INTEGER DEFAULT 100;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "quizScore" INTEGER;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "interviewScore" INTEGER;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "verificationUrl" TEXT;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "CertificateVerification" ADD COLUMN IF NOT EXISTS "ipHash" TEXT;
      ALTER TABLE "CertificateVerification" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
      ALTER TABLE "CertificateVerification" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE "CertificateVerification" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `)
    console.log("✅ Columns successfully created or verified in PostgreSQL!")

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_certificateCode_key" ON "Certificate"("certificateCode");
    `)
    console.log("✅ Unique index verified!")
  } catch (err) {
    console.error("Migration error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

runSafeMigration()
