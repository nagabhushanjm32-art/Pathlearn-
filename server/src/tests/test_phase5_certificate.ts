import app from "../app"
import prisma from "../utils/prisma"
import { Server } from "http"

async function runCertificateE2ETests() {
  console.log("==================================================")
  console.log("PHASE 5: PROFESSIONAL CERTIFICATE E2E TEST SUITE")
  console.log("==================================================")

  // 1. Start ephemeral server
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const address = server.address() as any
  const port = address.port
  const BASE_URL = `http://localhost:${port}/api`
  console.log(`[1] Test Server listening on port ${port}`)

  try {
    // 2. Register candidate user
    const email = `cert_candidate_${Date.now()}@pathlearn.dev`
    const password = "ProductionSecure2026!"
    const name = "PUNITH K"

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword: password,
      }),
    })
    const regData = (await regRes.json()) as any
    const cookieHeader = regRes.headers.get("set-cookie") || ""
    const cookie = cookieHeader.split(";")[0]
    const userId = regData.user?.id
    console.log(`[2] Registered User: ${name} (${userId})`)

    // 3. Ensure AI Engineer domain exists in DB
    let domain = await prisma.domain.findFirst({
      where: { slug: "ai-engineer" },
    })
    if (!domain) {
      domain = await prisma.domain.create({
        data: {
          name: "AI Engineer",
          slug: "ai-engineer",
          description: "End-to-end Machine Learning, Deep Learning, and RAG Architecture",
          difficulty: "INTERMEDIATE",
          estimatedDays: 60,
          skillTags: ["Python", "Machine Learning", "Transformers", "RAG Systems", "MLOps"],
        },
      })
    }
    console.log(`[3] Target Domain: ${domain.name} (${domain.slug})`)

    // 4. TEST 1: New user (0% roadmap) -> Expect LOCKED & Generation rejected
    const check1Res = await fetch(`${BASE_URL}/certificates/check-eligibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ domainSlug: "ai-engineer" }),
    })
    const check1Data = (await check1Res.json()) as any
    console.log(`[4] Test 1 (0% Roadmap Eligibility): eligible=${check1Data.eligible}, roadmapProgress=${check1Data.roadmapProgress}%`)

    if (check1Data.eligible !== false) {
      throw new Error("Test 1 Failed: New user should not be eligible")
    }

    const gen1Res = await fetch(`${BASE_URL}/certificates/generate/ai-engineer`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    console.log(`    Generation Attempt Status: ${gen1Res.status} (Expected 400 Bad Request)`)
    if (gen1Res.status !== 400) {
      throw new Error("Test 1 Failed: Server should reject generation when ineligible")
    }

    // 5. TEST 2 & 3: Setup Roadmap + Incomplete Quizzes + Failed Interview
    // Create roadmap in DB
    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        domainId: domain.id,
        progress: 100,
      },
    })

    const step1 = await prisma.roadmapStep.create({
      data: {
        roadmapId: roadmap.id,
        order: 1,
        title: "Introduction to Neural Networks",
        description: "Fundamentals of forward and backprop",
        difficulty: "BEGINNER",
        estimatedMinutes: 45,
        prerequisites: [],
        learningObjectives: ["Understand NN basics"],
        skillsGained: ["Neural Networks"],
        isLocked: false,
        isCompleted: true,
      },
    })

    const quiz1 = await prisma.quiz.create({
      data: {
        roadmapStepId: step1.id,
      },
    })

    await prisma.userStepProgress.create({
      data: {
        userId,
        stepId: step1.id,
        stepCompleted: true,
        quizCompleted: false, // Incomplete quiz
      },
    })

    const check2Res = await fetch(`${BASE_URL}/certificates/check-eligibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ domainSlug: "ai-engineer" }),
    })
    const check2Data = (await check2Res.json()) as any
    console.log(`[5] Test 2 (Incomplete Quizzes): eligible=${check2Data.eligible}, quizzesPassed=${check2Data.quizzesPassed}`)
    if (check2Data.eligible !== false || check2Data.quizzesPassed !== false) {
      throw new Error("Test 2 Failed: Should be ineligible when quizzes are pending")
    }

    // Pass the quiz but insert a failed interview (<60%)
    await prisma.userStepProgress.updateMany({
      where: { userId, stepId: step1.id },
      data: { quizCompleted: true },
    })

    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: quiz1.id,
        score: 85,
        totalCount: 5,
      },
    })

    const failedInterview = await prisma.mockInterview.create({
      data: {
        userId,
        domainId: domain.id,
        status: "COMPLETED",
        totalQuestions: 5,
        overallScore: 52, // Failed < 60%
        startedAt: new Date(),
        completedAt: new Date(),
      },
    })

    const check3Res = await fetch(`${BASE_URL}/certificates/check-eligibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ domainSlug: "ai-engineer" }),
    })
    const check3Data = (await check3Res.json()) as any
    console.log(`[6] Test 3 (Interview < 60%): eligible=${check3Data.eligible}, interviewScore=${check3Data.interviewScore}%, interviewPassed=${check3Data.interviewPassed}`)
    if (check3Data.eligible !== false || check3Data.interviewPassed !== false) {
      throw new Error("Test 3 Failed: Interview score 52% should not pass")
    }

    // 6. TEST 4: Satisfy all 3 requirements (Update interview >= 60%)
    await prisma.mockInterview.update({
      where: { id: failedInterview.id },
      data: { overallScore: 78 }, // Passed >= 60%
    })

    const check4Res = await fetch(`${BASE_URL}/certificates/check-eligibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ domainSlug: "ai-engineer" }),
    })
    const check4Data = (await check4Res.json()) as any
    console.log(`[7] Test 4 (Fully Eligible): eligible=${check4Data.eligible}, roadmap=${check4Data.roadmapProgress}%, quizzes=${check4Data.quizzesPassed}, interview=${check4Data.interviewScore}%`)
    if (check4Data.eligible !== true) {
      throw new Error("Test 4 Failed: Should be fully eligible")
    }

    // 7. TEST 5: Generate Certificate
    const genRes = await fetch(`${BASE_URL}/certificates/generate/ai-engineer`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const genData = (await genRes.json()) as any
    console.log(`[8] Test 5 (Generate Certificate): status=${genRes.status}, certId=${genData.certificate?.certificateId}, recipient=${genData.certificate?.recipientName}`)

    if (genRes.status !== 201 || !genData.certificate?.certificateId) {
      throw new Error("Test 5 Failed: Certificate was not generated")
    }
    const certCode = genData.certificate.certificateCode || genData.certificate.certificateId
    const certDbId = genData.certificate.id

    // 8. TEST 6: Duplicate Generation Prevention
    const dupRes = await fetch(`${BASE_URL}/certificates/generate/ai-engineer`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const dupData = (await dupRes.json()) as any
    console.log(`[9] Test 6 (Duplicate Prevention): status=${dupRes.status}, message="${dupData.message}", certId=${dupData.certificate?.certificateId}`)
    if (dupData.certificate?.certificateId !== certCode) {
      throw new Error("Test 6 Failed: Duplicate should return existing active certificate")
    }

    // 9. TEST 7: Get User Certificates Dashboard
    const userCertsRes = await fetch(`${BASE_URL}/certificates`, {
      headers: { Cookie: cookie },
    })
    const userCertsData = (await userCertsRes.json()) as any
    console.log(`[10] Test 7 (User Dashboard): status=${userCertsRes.status}, totalCertificates=${userCertsData.certificates?.length}`)
    if (userCertsData.certificates?.length !== 1) {
      throw new Error("Test 7 Failed: Expected 1 certificate in dashboard")
    }

    // 10. TEST 8: Download PDF Streaming
    const downloadRes = await fetch(`${BASE_URL}/certificates/${certDbId}/download`)
    const pdfBlob = await downloadRes.arrayBuffer()
    const contentType = downloadRes.headers.get("content-type")
    console.log(`[11] Test 8 (Download PDF): status=${downloadRes.status}, contentType=${contentType}, size=${pdfBlob.byteLength} bytes`)
    if (downloadRes.status !== 200 || !contentType?.includes("application/pdf") || pdfBlob.byteLength < 500) {
      throw new Error("Test 8 Failed: Invalid PDF streaming response")
    }

    // 11. TEST 9: Public Verification without Auth
    const verifyRes = await fetch(`${BASE_URL}/certificates/verify/${certCode}`)
    const verifyData = (await verifyRes.json()) as any
    console.log(`[12] Test 9 (Public Verification): status=${verifyRes.status}, authentic=${verifyData.authentic}, recipient="${verifyData.certificate?.recipientName}", domain="${verifyData.certificate?.domainName}"`)
    if (verifyData.authentic !== true || verifyData.certificate?.recipientName !== name) {
      throw new Error("Test 9 Failed: Public verification should confirm authenticity")
    }

    // 12. TEST 10: Invalid Certificate ID
    const invalidRes = await fetch(`${BASE_URL}/certificates/verify/PL-INVALID-99999`)
    const invalidData = (await invalidRes.json()) as any
    console.log(`[13] Test 10 (Invalid Certificate ID): status=${invalidRes.status}, authentic=${invalidData.authentic}, status=${invalidData.status}`)
    if (invalidRes.status !== 404 || invalidData.authentic !== false) {
      throw new Error("Test 10 Failed: Invalid certificate must return 404 / NOT_FOUND")
    }

    // 13. TEST 11: Revoke Certificate
    const revokeRes = await fetch(`${BASE_URL}/certificates/${certDbId}/revoke`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    console.log(`[14] Test 11 (Revoke Certificate): status=${revokeRes.status}`)

    const verifyRevokedRes = await fetch(`${BASE_URL}/certificates/verify/${certCode}`)
    const verifyRevokedData = (await verifyRevokedRes.json()) as any
    console.log(`[15] Test 11 (Public Verification on Revoked): status=${verifyRevokedRes.status}, authentic=${verifyRevokedData.authentic}, certStatus=${verifyRevokedData.status}`)
    if (verifyRevokedData.status !== "REVOKED" || verifyRevokedData.authentic !== false) {
      throw new Error("Test 11 Failed: Revoked certificate should reflect REVOKED status")
    }

    console.log("\n==================================================")
    console.log("🎉 ALL PHASE 5 CERTIFICATE SYSTEM TESTS PASSED 100%!")
    console.log("==================================================")

    server.close()
    process.exit(0)
  } catch (err) {
    console.error("❌ TEST FAILED:", err)
    server.close()
    process.exit(1)
  }
}

runCertificateE2ETests()
