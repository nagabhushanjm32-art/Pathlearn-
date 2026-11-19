import app from "../app"
import prisma from "../utils/prisma"
import { Server } from "http"

async function runInterviewTests() {
  console.log("==================================================")
  console.log("PHASE 4: AI ADAPTIVE MOCK INTERVIEW LIFECYCLE TEST")
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
    // 2. Register test user
    const email = `interview_candidate_${Date.now()}@pathlearn.dev`
    const password = "Password2026!"
    const name = "Alex Mercer"

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
    console.log(`[2] Register User: status=${regRes.status}, user=${regData.user?.email}`)

    // 3. Ensure AI Engineer domain exists
    let domain = await prisma.domain.findFirst({
      where: { slug: "ai-engineer" },
    })
    if (!domain) {
      domain = await prisma.domain.create({
        data: {
          name: "AI Engineer",
          slug: "ai-engineer",
          description: "End-to-end Machine Learning, Deep Learning, LLMs, and RAG Architecture",
          difficulty: "INTERMEDIATE",
          estimatedDays: 60,
          skillTags: ["Python", "Machine Learning", "Transformers", "RAG", "MLOps"],
        },
      })
    }
    console.log(`[3] Target Domain: ${domain.name} (${domain.slug})`)

    // 4. POST /api/interviews - Create interview session
    const createRes = await fetch(`${BASE_URL}/interviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        domainSlug: "ai-engineer",
        difficulty: "INTERMEDIATE",
        type: "TECHNICAL",
      }),
    })
    const createData = (await createRes.json()) as any
    console.log(`[4] Create Interview: status=${createRes.status}, id=${createData.interview?.id}, status=${createData.interview?.status}`)
    const interviewId = createData.interview?.id

    if (!interviewId) {
      throw new Error("Failed to obtain interview ID from create endpoint")
    }

    // 5. POST /api/interviews/:id/start - Generate Question 1
    const startRes = await fetch(`${BASE_URL}/interviews/${interviewId}/start`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const startData = (await startRes.json()) as any
    console.log(`[5] Start Interview Session (Question 1): status=${startRes.status}`)
    console.log(`    Q1 Topic: ${startData.currentQuestion?.topic}`)
    console.log(`    Q1 Difficulty: ${startData.currentQuestion?.difficulty}`)
    console.log(`    Q1 Type: ${startData.currentQuestion?.questionType}`)
    console.log(`    Q1 Text: "${startData.currentQuestion?.question}"`)

    const q1Id = startData.currentQuestion?.id

    // 6. POST /api/interviews/:id/answer - Submit Answer 1
    const answer1Text =
      "Supervised learning trains on labeled data pairs with explicit ground truth targets like classification and regression. Unsupervised learning discovers latent patterns and clusters without labels, such as K-Means or PCA. Reinforcement learning optimizes an agent policy via reward signals and environment feedback, such as game playing or robotics."
    const ans1Res = await fetch(`${BASE_URL}/interviews/${interviewId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        questionId: q1Id,
        order: 1,
        answer: answer1Text,
      }),
    })
    const ans1Data = (await ans1Res.json()) as any
    console.log(`[6] Submit Answer 1: status=${ans1Res.status}`)
    console.log(`    Score: ${ans1Data.evaluation?.score}%`)
    console.log(`    Correctness: ${ans1Data.evaluation?.correctness}%`)
    console.log(`    Technical Depth: ${ans1Data.evaluation?.technicalDepth}%`)
    console.log(`    Clarity: ${ans1Data.evaluation?.clarity}%`)
    console.log(`    Knowledge Level: ${ans1Data.evaluation?.knowledgeLevel}`)
    console.log(`    Feedback: "${ans1Data.evaluation?.feedback}"`)

    // 7. POST /api/interviews/:id/next-question - Generate adaptive Question 2
    const nextQRes = await fetch(`${BASE_URL}/interviews/${interviewId}/next-question`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const nextQData = (await nextQRes.json()) as any
    console.log(`[7] Generate Next Adaptive Question (Q2): status=${nextQRes.status}`)
    console.log(`    Q2 Topic: ${nextQData.question?.topic}`)
    console.log(`    Q2 Difficulty (Adapted): ${nextQData.question?.difficulty}`)
    console.log(`    Q2 Question: "${nextQData.question?.question}"`)

    // 8. Submit Answer 2
    const ans2Text =
      "To diagnose high validation error vs training accuracy, I would check for overfitting. Remedies include L1/L2 weight regularization, dropout layers, data augmentation, early stopping on validation loss, and reducing model capacity or collecting more diverse training data."
    const ans2Res = await fetch(`${BASE_URL}/interviews/${interviewId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        questionId: nextQData.question?.id,
        order: 2,
        answer: ans2Text,
      }),
    })
    const ans2Data = (await ans2Res.json()) as any
    console.log(`[8] Submit Answer 2: status=${ans2Res.status}, score=${ans2Data.evaluation?.score}%`)

    // 9. POST /api/interviews/:id/complete - Complete interview & calculate final score
    const completeRes = await fetch(`${BASE_URL}/interviews/${interviewId}/complete`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const completeData = (await completeRes.json()) as any
    console.log(`[9] Complete Interview & Multi-Dimensional Report: status=${completeRes.status}`)
    console.log(`    Overall Score: ${completeData.interview?.overallScore}%`)
    console.log(`    Technical Score: ${completeData.interview?.technicalScore}%`)
    console.log(`    Problem Solving Score: ${completeData.interview?.problemSolvingScore}%`)
    console.log(`    Communication Score: ${completeData.interview?.communicationScore}%`)
    console.log(`    Practical Score: ${completeData.interview?.practicalScore}%`)
    console.log(`    Conceptual Score: ${completeData.interview?.conceptualScore}%`)
    console.log(`    Readiness Level: ${completeData.interview?.readinessLevel}`)
    console.log(`    Recommendation: "${completeData.interview?.recommendation}"`)

    // 10. GET /api/interviews/:id/result - Retrieve evaluation result
    const resultRes = await fetch(`${BASE_URL}/interviews/${interviewId}/result`, {
      headers: { Cookie: cookie },
    })
    const resultData = (await resultRes.json()) as any
    console.log(`[10] Get Interview Result: status=${resultRes.status}, isPassed=${resultData.isPassed}`)

    // 11. GET /api/interviews/history - Retrieve user's interview history
    const histRes = await fetch(`${BASE_URL}/interviews/history`, {
      headers: { Cookie: cookie },
    })
    const histData = (await histRes.json()) as any
    console.log(`[11] Get Interview History: status=${histRes.status}, count=${histData.interviews?.length}`)

    // 12. GET /api/certificates/:domainId/eligibility - Verify mock interview requirement in certificate eligibility
    const eligRes = await fetch(`${BASE_URL}/certificates/ai-engineer/eligibility`, {
      headers: { Cookie: cookie },
    })
    const eligData = (await eligRes.json()) as any
    console.log(`[12] Certificate Eligibility Check: status=${eligRes.status}`)
    console.log(`     Mock Interview Passed: ${eligData.eligibility?.mockInterviewPassed}`)
    console.log(`     Mock Interview Score: ${eligData.eligibility?.mockInterviewScore}%`)
    console.log(`     Requirements Met: ${eligData.eligibility?.requirementsMetCount} / ${eligData.eligibility?.totalRequirementsCount}`)

    console.log("\n==================================================")
    console.log("🎉 ALL PHASE 4 INTERVIEW LIFECYCLE TESTS PASSED!")
    console.log("==================================================")

    server.close()
    process.exit(0)
  } catch (error) {
    console.error("❌ TEST FAILED:", error)
    server.close()
    process.exit(1)
  }
}

runInterviewTests()
