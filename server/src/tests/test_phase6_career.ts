import app from "../app"
import prisma from "../utils/prisma"
import { Server } from "http"
import { PDFDocument, StandardFonts } from "pdf-lib"

async function generateSamplePdfBuffer(name: string, email: string): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([600, 800])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  page.drawText(name.toUpperCase(), { x: 50, y: 750, size: 18, font: fontBold })
  page.drawText(`${email} | (555) 234-5678 | github.com/candidate | linkedin.com/in/candidate`, {
    x: 50,
    y: 730,
    size: 10,
    font,
  })

  page.drawText("TECHNICAL SKILLS", { x: 50, y: 690, size: 12, font: fontBold })
  page.drawText(
    "Languages & Frameworks: Python, SQL, JavaScript, TypeScript, Scikit-Learn, Pandas, NumPy, FastAPI, Git, Docker",
    { x: 50, y: 670, size: 10, font }
  )

  page.drawText("EDUCATION", { x: 50, y: 630, size: 12, font: fontBold })
  page.drawText("B.S. in Computer Science - State University, 2024 (GPA: 3.8/4.0)", {
    x: 50,
    y: 610,
    size: 10,
    font,
  })

  page.drawText("EXPERIENCE & PROJECTS", { x: 50, y: 570, size: 12, font: fontBold })
  page.drawText("AI Healthcare Chatbot - Developed conversational triaging pipeline with Python and FastAPI.", {
    x: 50,
    y: 550,
    size: 10,
    font,
  })
  page.drawText("Credit Fraud Detection - Built supervised classification pipeline achieving 94% ROC-AUC.", {
    x: 50,
    y: 530,
    size: 10,
    font,
  })

  const pdfBytes = await doc.save()
  return Buffer.from(pdfBytes)
}

async function runCareerE2ETests() {
  console.log("==================================================")
  console.log("PHASE 6: AI CAREER PROFILE & RESUME ANALYZER E2E")
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
    const email = `career_user_${Date.now()}@pathlearn.dev`
    const password = "ProductionSecure2026!"
    const name = "PUNITH K R"

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

    // 3. TEST 1: Initial Career Profile State
    const profileRes1 = await fetch(`${BASE_URL}/career/profile`, {
      headers: { Cookie: cookie },
    })
    const profileData1 = (await profileRes1.json()) as any
    console.log(`[3] Test 1 (Initial Profile): status=${profileRes1.status}, targetRole=${profileData1.careerProfile?.targetRole}, hasResume=${profileData1.resumeStatus?.hasResume}`)
    if (profileRes1.status !== 200 || profileData1.resumeStatus?.hasResume !== false) {
      throw new Error("Test 1 Failed: Initial state should have hasResume=false")
    }

    // 4. TEST 2: Update Target Role
    const roleRes = await fetch(`${BASE_URL}/career/target-role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ targetRole: "AI Engineer" }),
    })
    const roleData = (await roleRes.json()) as any
    console.log(`[4] Test 2 (Update Target Role): status=${roleRes.status}, targetRole=${roleData.targetRole}, gaps=${roleData.skillGaps?.length}`)
    if (roleRes.status !== 200 || roleData.targetRole !== "AI Engineer" || !roleData.skillGaps?.length) {
      throw new Error("Test 2 Failed: Target role update failed")
    }

    // 5. TEST 3: Invalid File Type Rejection
    const invalidBoundary = "----WebKitFormBoundaryInvalid123"
    const invalidBody = [
      `--${invalidBoundary}`,
      'Content-Disposition: form-data; name="resume"; filename="virus.exe"',
      "Content-Type: application/x-msdownload",
      "",
      "MALICIOUS_BINARY_MOCK",
      `--${invalidBoundary}--`,
    ].join("\r\n")

    const invalidRes = await fetch(`${BASE_URL}/career/resume/upload`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${invalidBoundary}`,
        Cookie: cookie,
      },
      body: invalidBody,
    })
    console.log(`[5] Test 3 (Invalid File Rejection): status=${invalidRes.status} (Expected 400 or 500 error rejection)`)
    if (invalidRes.status === 200) {
      throw new Error("Test 3 Failed: Server should not accept executable files")
    }

    // 6. TEST 4: PDF Resume Upload & Parsing
    const samplePdf = await generateSamplePdfBuffer(name, email)
    const boundary = "----WebKitFormBoundaryTest789"
    const preHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`
    )
    const postHeader = Buffer.from(`\r\n--${boundary}--\r\n`)
    const multipartBody = Buffer.concat([preHeader, samplePdf, postHeader])

    const uploadRes = await fetch(`${BASE_URL}/career/resume/upload`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Cookie: cookie,
      },
      body: multipartBody,
    })
    const uploadData = (await uploadRes.json()) as any
    console.log(`[6] Test 4 (PDF Resume Upload): status=${uploadRes.status}, resumeScore=${uploadData.resumeAnalysis?.resumeScore}, extractedSkills=${uploadData.resumeAnalysis?.parsedData?.skills?.allSkills?.length}`)
    if (uploadRes.status !== 200 || !uploadData.resumeAnalysis) {
      throw new Error("Test 4 Failed: Resume upload & analysis failed")
    }

    // 7. TEST 5: Verify User Skills Extraction
    const skillsRes = await fetch(`${BASE_URL}/career/skills`, {
      headers: { Cookie: cookie },
    })
    const skillsData = (await skillsRes.json()) as any
    console.log(`[7] Test 5 (Discovered Skills): status=${skillsRes.status}, totalDiscovered=${skillsData.skills?.length}`)
    if (skillsRes.status !== 200 || skillsData.skills?.length === 0) {
      throw new Error("Test 5 Failed: Discovered skills list is empty")
    }

    // 8. TEST 6: Skill Gap Benchmark Analysis
    const gapRes = await fetch(`${BASE_URL}/career/skill-gaps?targetRole=AI%20Engineer`, {
      headers: { Cookie: cookie },
    })
    const gapData = (await gapRes.json()) as any
    console.log(`[8] Test 6 (Skill Gaps): status=${gapRes.status}, totalGaps=${gapData.skillGaps?.length}`)
    const pythonGap = gapData.skillGaps?.find((g: any) => g.skillName === "Python")
    const pytorchGap = gapData.skillGaps?.find((g: any) => g.skillName === "PyTorch")
    console.log(`    Python Match: ${pythonGap?.matchPercentage}% (${pythonGap?.currentLevel})`)
    console.log(`    PyTorch Match: ${pytorchGap?.matchPercentage}% (${pytorchGap?.currentLevel})`)
    if (gapRes.status !== 200 || !pythonGap || !pytorchGap) {
      throw new Error("Test 6 Failed: Skill gap benchmarking failed")
    }

    // 9. TEST 7: Transparent Career Readiness Calculation
    const readinessRes = await fetch(`${BASE_URL}/career/readiness`, {
      headers: { Cookie: cookie },
    })
    const readinessData = (await readinessRes.json()) as any
    console.log(`[9] Test 7 (Career Readiness): status=${readinessRes.status}, score=${readinessData.readinessScore}%, techSkills=${readinessData.breakdown?.technicalSkills}%`)
    if (readinessRes.status !== 200 || readinessData.readinessScore <= 0 || !readinessData.breakdown?.formulaExplanation) {
      throw new Error("Test 7 Failed: Readiness calculation breakdown missing")
    }

    // 10. TEST 8: Portfolio Project Recommendations
    const projRes = await fetch(`${BASE_URL}/career/recommendations`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const projData = (await projRes.json()) as any
    console.log(`[10] Test 8 (Project Recommendations): status=${projRes.status}, totalProjects=${projData.projects?.length}`)
    if (projRes.status !== 200 || projData.projects?.length === 0) {
      throw new Error("Test 8 Failed: Project recommendations missing")
    }

    // 11. TEST 9: Roadmap Personalization (Boost Weak Areas)
    const personRes = await fetch(`${BASE_URL}/career/roadmap/personalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({ targetRole: "AI Engineer" }),
    })
    const personData = (await personRes.json()) as any
    console.log(`[11] Test 9 (Personalize Roadmap): status=${personRes.status}, prioritized=${personData.prioritizedSkills?.length}`)
    if (personRes.status !== 200 || !personData.prioritizedSkills) {
      throw new Error("Test 9 Failed: Roadmap personalization failed")
    }

    // 12. TEST 10: ATS Keyword Analysis & Resume Improvement
    const impRes = await fetch(`${BASE_URL}/career/resume/improve`, {
      method: "POST",
      headers: { Cookie: cookie },
    })
    const impData = (await impRes.json()) as any
    console.log(`[12] Test 10 (Resume Improvement): status=${impRes.status}, matchedKeywords=${impData.atsKeywords?.matched?.length}, missingKeywords=${impData.atsKeywords?.missing?.length}`)
    if (impRes.status !== 200 || !impData.atsKeywords) {
      throw new Error("Test 10 Failed: ATS keyword improvement failed")
    }

    // 13. TEST 11: Resume Deletion & Privacy Reset
    const delRes = await fetch(`${BASE_URL}/career/resume`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    })
    console.log(`[13] Test 11 (Delete Resume): status=${delRes.status}`)

    const profileRes2 = await fetch(`${BASE_URL}/career/profile`, {
      headers: { Cookie: cookie },
    })
    const profileData2 = (await profileRes2.json()) as any
    console.log(`[14] Test 11 (Verified Deleted): hasResume=${profileData2.resumeStatus?.hasResume}`)
    if (profileData2.resumeStatus?.hasResume !== false) {
      throw new Error("Test 11 Failed: Resume was not deleted")
    }

    console.log("\n==================================================")
    console.log("🎉 ALL PHASE 6 AI CAREER PROFILE TESTS PASSED 100%!")
    console.log("==================================================")

    server.close()
    process.exit(0)
  } catch (err) {
    console.error("❌ TEST FAILED:", err)
    server.close()
    process.exit(1)
  }
}

runCareerE2ETests()
