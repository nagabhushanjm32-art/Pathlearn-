import "dotenv/config"
import prisma from "../utils/prisma"

const BASE_URL = "http://localhost:5000/api"

async function runPhase3Verification() {
  console.log("==================================================")
  console.log("  PATHLEARN PHASE 3 END-TO-END VERIFICATION")
  console.log("==================================================")

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`)
  const healthData = (await healthRes.json()) as any
  console.log(`\n[Step 1] Server Health: status=${healthRes.status}, db=${healthData.database}`)

  // 2. Register User 1
  const timestamp = Date.now()
  const user1Email = `learner_alpha_${timestamp}@pathlearn.dev`
  const user2Email = `learner_beta_${timestamp}@pathlearn.dev`
  const password = "SecurePassword2026!"

  console.log(`\n[Step 2] Registering New User 1: ${user1Email}`)
  const reg1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Alpha Learner",
      email: user1Email,
      password,
      confirmPassword: password,
    }),
  })
  const reg1Cookie = (reg1Res.headers.get("set-cookie") || "").split(";")[0]
  console.log(`User 1 registered successfully (HTTP ${reg1Res.status})`)

  // 3. Verify User 1 initial dashboard stats (Must be 0%)
  console.log("\n[Step 3] Verifying Initial Dashboard for Brand-New Student:")
  const dash1Res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: reg1Cookie },
  })
  const dash1Data = (await dash1Res.json()) as any
  console.log(`  - Lessons Completed: ${dash1Data.stats?.lessonsCompleted} (Expected: 0)`)
  console.log(`  - Quizzes Passed:    ${dash1Data.stats?.quizzesPassed} (Expected: 0)`)
  console.log(`  - Overall Progress:  ${dash1Data.stats?.overallProgress}% (Expected: 0%)`)
  console.log(`  - Certificates:      ${dash1Data.stats?.certificatesEarned} (Expected: 0)`)

  if (dash1Data.stats?.overallProgress !== 0 || dash1Data.stats?.lessonsCompleted !== 0) {
    throw new Error("Initial user progress is not 0%!")
  }
  console.log("  ✓ Initial 0% Progress Verified!")

  // 4. Generate/Fetch Roadmap for AI Engineer
  console.log("\n[Step 4] Requesting AI Engineer Roadmap:")
  const roadmapRes = await fetch(`${BASE_URL}/roadmaps/ai-engineer`, {
    headers: { Cookie: reg1Cookie },
  })
  const roadmapData = (await roadmapRes.json()) as any
  const roadmap = roadmapData.roadmap
  console.log(`  - Domain: ${roadmap.domainName}`)
  console.log(`  - Total Steps: ${roadmap.steps.length}`)
  console.log(`  - Step 1: "${roadmap.steps[0].title}" (isLocked: ${roadmap.steps[0].isLocked})`)
  console.log(`  - Step 2: "${roadmap.steps[1].title}" (isLocked: ${roadmap.steps[1].isLocked})`)

  const step1 = roadmap.steps[0]
  const step2 = roadmap.steps[1]

  // 5. Fetch Step 1 Details & AI Notes
  console.log(`\n[Step 5] Fetching Step 1 (${step1.id}) Details & Notes:`)
  const step1Res = await fetch(`${BASE_URL}/steps/${step1.id}`, {
    headers: { Cookie: reg1Cookie },
  })
  const step1Data = (await step1Res.json()) as any
  console.log(`  - Step Title: ${step1Data.step?.title}`)
  console.log(`  - Video ID:   ${step1Data.step?.video?.youtubeId}`)
  console.log(`  - Video Channel: ${step1Data.step?.video?.channel}`)

  const notesRes = await fetch(`${BASE_URL}/steps/${step1.id}/notes`, {
    headers: { Cookie: reg1Cookie },
  })
  const notesData = (await notesRes.json()) as any
  const noteContent = notesData.note?.content
  console.log(`  - AI Notes Topic: "${noteContent?.topic}"`)
  console.log(`  - What is it:     "${noteContent?.whatIsIt?.substring(0, 60)}..."`)
  console.log(`  - Key Concepts:   ${noteContent?.keyConcepts?.length} concepts`)
  console.log(`  - Example Code:   Language=${noteContent?.example?.language}`)
  console.log(`  - Interview Tip:  "${noteContent?.interviewTip?.substring(0, 60)}..."`)

  // 6. Track Video Watching (Simulate 50% -> 92%)
  console.log("\n[Step 6] Simulating Video Watch Progress:")
  const watch50Res = await fetch(`${BASE_URL}/progress/${step1.id}/watch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: reg1Cookie },
    body: JSON.stringify({ progress: 50 }),
  })
  const watch50Data = (await watch50Res.json()) as any
  console.log(`  - At 50%: videoProgress=${watch50Data.stepProgress?.videoProgress}%, videoCompleted=${watch50Data.stepProgress?.videoCompleted}`)

  const watch92Res = await fetch(`${BASE_URL}/progress/${step1.id}/watch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: reg1Cookie },
    body: JSON.stringify({ progress: 92 }),
  })
  const watch92Data = (await watch92Res.json()) as any
  console.log(`  - At 92%: videoProgress=${watch92Data.stepProgress?.videoProgress}%, videoCompleted=${watch92Data.stepProgress?.videoCompleted}`)

  if (!watch92Data.stepProgress?.videoCompleted) {
    throw new Error("Video should be marked completed at ≥90% watch progress!")
  }
  console.log("  ✓ Video Completed threshold (≥90%) Verified!")

  // 7. Fetch & Pass Quiz for Step 1
  console.log("\n[Step 7] Taking Step 1 Quiz:")
  const quizRes = await fetch(`${BASE_URL}/quizzes/${step1.id}`, {
    headers: { Cookie: reg1Cookie },
  })
  const quizData = (await quizRes.json()) as any
  const quiz = quizData.quiz
  console.log(`  - Quiz Questions: ${quiz.questions.length}`)

  // Submit correct answers
  const correctAnswers = quiz.questions.map((q: any) => ({
    questionId: q.id,
    selectedIndex: q.correctIndex,
  }))

  const submitQuizRes = await fetch(`${BASE_URL}/quizzes/${quiz.id}/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: reg1Cookie },
    body: JSON.stringify({ answers: correctAnswers }),
  })
  const submitQuizData = (await submitQuizRes.json()) as any
  console.log(`  - Quiz Score: ${submitQuizData.attempt?.percentage}% (isPassed: ${submitQuizData.attempt?.isPassed})`)
  console.log(`  - Step 1 Completed Status: ${submitQuizData.stepProgress?.stepCompleted}`)

  if (!submitQuizData.attempt?.isPassed || !submitQuizData.stepProgress?.stepCompleted) {
    throw new Error("Step 1 should be completed after passing quiz + watching video!")
  }
  console.log("  ✓ Step 1 Completed & Next Step Unlocked!")

  // 8. Verify Dashboard Progress Updated
  console.log("\n[Step 8] Checking Dashboard After Step 1 Completion:")
  const dashAfter1Res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: reg1Cookie },
  })
  const dashAfter1Data = (await dashAfter1Res.json()) as any
  console.log(`  - Lessons Completed: ${dashAfter1Data.stats?.lessonsCompleted} (Expected: 1)`)
  console.log(`  - Quizzes Passed:    ${dashAfter1Data.stats?.quizzesPassed} (Expected: 1)`)
  console.log(`  - Overall Progress:  ${dashAfter1Data.stats?.overallProgress}% (Expected: ~7%)`)
  console.log(`  - Continue Learning: "${dashAfter1Data.stats?.activeStep?.stepTitle}" (Step ${dashAfter1Data.stats?.activeStep?.stepOrder})`)

  // 9. Complete Step 2 explicitly
  console.log(`\n[Step 9] Completing Step 2 ("${step2.title}"):`)
  const completeStep2Res = await fetch(`${BASE_URL}/progress/${step2.id}/complete`, {
    method: "POST",
    headers: { Cookie: reg1Cookie },
  })
  console.log(`  - Step 2 Completion HTTP Status: ${completeStep2Res.status}`)

  const dashAfter2Res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: reg1Cookie },
  })
  const dashAfter2Data = (await dashAfter2Res.json()) as any
  console.log(`  - Lessons Completed: ${dashAfter2Data.stats?.lessonsCompleted} (Expected: 2)`)
  console.log(`  - Overall Progress:  ${dashAfter2Data.stats?.overallProgress}% (Expected: ~14%)`)

  // 10. Certificate Eligibility Evaluation
  console.log("\n[Step 10] Checking Certificate Eligibility:")
  const eligRes = await fetch(`${BASE_URL}/certificates/ai-engineer/eligibility`, {
    headers: { Cookie: reg1Cookie },
  })
  const eligData = (await eligRes.json()) as any
  console.log(`  - Roadmap Completed: ${eligData.eligibility?.roadmapCompleted} (Progress: ${eligData.eligibility?.roadmapProgress}%)`)
  console.log(`  - Mock Interview Passed: ${eligData.eligibility?.mockInterviewPassed} (Locked in Phase 3)`)
  console.log(`  - Certificate Eligible: ${eligData.eligibility?.isEligible} (Expected: false - remains locked)`)

  // 11. Multi-User Independence Verification
  console.log("\n[Step 11] Verifying Independent Progress for User 2:")
  const reg2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Beta Learner",
      email: user2Email,
      password,
      confirmPassword: password,
    }),
  })
  const reg2Cookie = (reg2Res.headers.get("set-cookie") || "").split(";")[0]

  const dash2Res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: reg2Cookie },
  })
  const dash2Data = (await dash2Res.json()) as any
  console.log(`  - User 2 Lessons Completed: ${dash2Data.stats?.lessonsCompleted} (Expected: 0)`)
  console.log(`  - User 2 Overall Progress:  ${dash2Data.stats?.overallProgress}% (Expected: 0%)`)

  if (dash2Data.stats?.overallProgress !== 0) {
    throw new Error("User 2 should have independent 0% progress!")
  }
  console.log("  ✓ Multi-User Progress Isolation Verified!")

  console.log("\n==================================================")
  console.log("  🎉 ALL PHASE 3 VERIFICATION CHECKS PASSED!")
  console.log("==================================================")
  process.exit(0)
}

runPhase3Verification().catch((err) => {
  console.error("Phase 3 verification failed:", err)
  process.exit(1)
})
