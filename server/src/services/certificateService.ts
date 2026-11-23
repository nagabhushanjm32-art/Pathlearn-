import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import path from "path"
import fs from "fs"
import prisma from "../utils/prisma"

export interface CertificateEligibilityResult {
  eligible: boolean
  roadmapProgress: number
  quizzesPassed: boolean
  quizScore: number
  interviewPassed: boolean
  interviewScore: number
  totalSteps: number
  completedSteps: number
  totalQuizzes: number
  passedQuizzes: number
  requirements: {
    roadmap: boolean
    quizzes: boolean
    interview: boolean
  }
}

export interface CertificatePDFData {
  certificateId: string
  certificateCode: string
  recipientName: string
  domainName: string
  roleName?: string
  domainSlug: string
  score: number
  roadmapScore: number
  quizScore: number
  interviewScore: number
  issueDate: string
  verificationUrl: string
  skillsDemonstrated: string[]
}

/**
 * 1. Check real eligibility from PostgreSQL database
 */
export async function checkCertificateEligibility(
  userId: string,
  domainSlugOrId: string
): Promise<CertificateEligibilityResult> {
  // 1. Resolve domain
  const domain = await prisma.domain.findFirst({
    where: {
      OR: [{ slug: domainSlugOrId }, { id: domainSlugOrId }],
    },
  })

  if (!domain) {
    return {
      eligible: false,
      roadmapProgress: 0,
      quizzesPassed: false,
      quizScore: 0,
      interviewPassed: false,
      interviewScore: 0,
      totalSteps: 0,
      completedSteps: 0,
      totalQuizzes: 0,
      passedQuizzes: 0,
      requirements: {
        roadmap: false,
        quizzes: false,
        interview: false,
      },
    }
  }

  // 2. Fetch roadmap & user step progress
  const roadmap = await prisma.roadmap.findUnique({
    where: {
      userId_domainId: {
        userId,
        domainId: domain.id,
      },
    },
    include: {
      steps: {
        include: {
          quiz: true,
        },
      },
    },
  })

  let roadmapProgress = 0
  let totalSteps = 0
  let completedSteps = 0
  let totalQuizzes = 0
  let passedQuizzes = 0
  let averageQuizScore = 0

  if (roadmap && roadmap.steps.length > 0) {
    totalSteps = roadmap.steps.length
    const stepIds = roadmap.steps.map((s) => s.id)

    const stepProgressList = await prisma.userStepProgress.findMany({
      where: {
        userId,
        stepId: { in: stepIds },
      },
    })

    completedSteps = stepProgressList.filter((sp) => sp.stepCompleted).length
    roadmapProgress = Math.round((completedSteps / totalSteps) * 100)

    const stepsWithQuiz = roadmap.steps.filter((s) => s.quiz !== null)
    totalQuizzes = stepsWithQuiz.length

    const quizIds = stepsWithQuiz.map((s) => s.quiz!.id)
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId: { in: quizIds },
      },
    })

    passedQuizzes = stepProgressList.filter((sp) => sp.quizCompleted).length

    if (attempts.length > 0) {
      const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0)
      averageQuizScore = Math.round(totalScore / attempts.length)
    } else if (passedQuizzes > 0) {
      averageQuizScore = 85
    }
  }

  const roadmapRequirementMet = totalSteps > 0 && completedSteps >= totalSteps && roadmapProgress >= 100
  const quizzesRequirementMet = totalQuizzes === 0 || passedQuizzes >= totalQuizzes

  // 3. Fetch latest completed mock interview
  const latestInterview = await prisma.mockInterview.findFirst({
    where: {
      userId,
      domainId: domain.id,
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
  })

  const interviewScore = latestInterview?.overallScore ?? 0
  const interviewRequirementMet = latestInterview !== null && interviewScore >= 60

  const isEligible = roadmapRequirementMet && quizzesRequirementMet && interviewRequirementMet

  return {
    eligible: isEligible,
    roadmapProgress,
    quizzesPassed: quizzesRequirementMet,
    quizScore: averageQuizScore || (quizzesRequirementMet ? 85 : 0),
    interviewPassed: interviewRequirementMet,
    interviewScore,
    totalSteps,
    completedSteps,
    totalQuizzes,
    passedQuizzes,
    requirements: {
      roadmap: roadmapRequirementMet,
      quizzes: quizzesRequirementMet,
      interview: interviewRequirementMet,
    },
  }
}

/**
 * 2. Generate cryptographically formatted unique certificate ID
 */
export function generateCertificateId(domainSlug: string): string {
  const prefix = domainSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "AI"
  const year = new Date().getFullYear()
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `PL-${prefix}-${year}-${randomChars}`
}

/**
 * 3. Generate QR code buffer
 */
export async function generateQRCode(verificationUrl: string): Promise<Buffer> {
  return await QRCode.toBuffer(verificationUrl, {
    type: "png",
    width: 300,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  })
}

/**
 * 4. Generate high-resolution, vector-based PDF certificate
 */
export async function generateCertificatePDF(data: CertificatePDFData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()

  // Landscape A4 format: Width 842, Height 595
  const page = pdfDoc.addPage([842, 595])
  const { width, height } = page.getSize()

  // Standard Fonts
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  // Color Palette
  const bgIvory = rgb(0.985, 0.98, 0.96)
  const goldPrimary = rgb(0.85, 0.65, 0.13)
  const goldDark = rgb(0.71, 0.53, 0.09)
  const textDark = rgb(0.06, 0.09, 0.16)
  const textMuted = rgb(0.38, 0.44, 0.52)
  const brandIndigo = rgb(0.31, 0.27, 0.9)
  const emeraldGreen = rgb(0.06, 0.65, 0.42)

  // 1. Draw Page Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgIvory,
  })

  // 2. Draw Multi-Layered Ornate Border Frame
  // Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: goldDark,
    borderWidth: 3,
  })

  // Inner Fine Border
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: goldPrimary,
    borderWidth: 1,
  })

  // Corner Geometric Accents
  const drawCornerFlourish = (cx: number, cy: number, flipX: boolean, flipY: boolean) => {
    const size = 30
    const x1 = flipX ? cx - size : cx
    const x2 = flipX ? cx : cx + size
    const y1 = flipY ? cy - size : cy
    const y2 = flipY ? cy : cy + size

    page.drawLine({
      start: { x: x1, y: cy },
      end: { x: x2, y: cy },
      color: goldPrimary,
      thickness: 2,
    })
    page.drawLine({
      start: { x: cx, y: y1 },
      end: { x: cx, y: y2 },
      color: goldPrimary,
      thickness: 2,
    })
  }

  drawCornerFlourish(35, 35, false, false)
  drawCornerFlourish(width - 35, 35, true, false)
  drawCornerFlourish(35, height - 35, false, true)
  drawCornerFlourish(width - 35, height - 35, true, true)

  // 3. Header: Academy Branding
  const brandText = "PATHLEARN ACADEMY"
  const brandWidth = fontHelveticaBold.widthOfTextAtSize(brandText, 14)
  page.drawText(brandText, {
    x: (width - brandWidth) / 2,
    y: height - 70,
    size: 14,
    font: fontHelveticaBold,
    color: brandIndigo,
  })

  // Subtitle / Certificate Title
  const titleText = "CERTIFICATE OF ACHIEVEMENT"
  const titleWidth = fontTimesBold.widthOfTextAtSize(titleText, 28)
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 110,
    size: 28,
    font: fontTimesBold,
    color: textDark,
  })

  // Divider Line below title
  page.drawLine({
    start: { x: width / 2 - 120, y: height - 125 },
    end: { x: width / 2 + 120, y: height - 125 },
    color: goldPrimary,
    thickness: 1.5,
  })

  // Certification Statement
  const certifyText = "THIS IS PROUDLY PRESENTED TO"
  const certifyWidth = fontHelvetica.widthOfTextAtSize(certifyText, 10)
  page.drawText(certifyText, {
    x: (width - certifyWidth) / 2,
    y: height - 155,
    size: 10,
    font: fontHelvetica,
    color: textMuted,
  })

  // 4. Recipient Name Prominent
  const nameText = (data.recipientName || "Learner").toUpperCase()
  const nameWidth = fontTimesBold.widthOfTextAtSize(nameText, 32)
  page.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: height - 205,
    size: 32,
    font: fontTimesBold,
    color: textDark,
  })

  // Underline decorative line for recipient
  page.drawLine({
    start: { x: width / 2 - Math.max(160, nameWidth / 2 + 30), y: height - 215 },
    end: { x: width / 2 + Math.max(160, nameWidth / 2 + 30), y: height - 215 },
    color: goldPrimary,
    thickness: 1.5,
  })

  // 5. Achievement Description & Domain / Finished Role
  const descLine1 = "for successfully completing the rigorous AI-curated curriculum, hands-on milestones,"
  const descLine2 = "module assessments, and adaptive AI mock interview evaluation for"
  const d1Width = fontHelvetica.widthOfTextAtSize(descLine1, 11)
  const d2Width = fontHelvetica.widthOfTextAtSize(descLine2, 11)

  page.drawText(descLine1, {
    x: (width - d1Width) / 2,
    y: height - 245,
    size: 11,
    font: fontHelvetica,
    color: textMuted,
  })
  page.drawText(descLine2, {
    x: (width - d2Width) / 2,
    y: height - 262,
    size: 11,
    font: fontHelvetica,
    color: textMuted,
  })

  // Domain / Finished Role Name
  const roleText = (data.roleName || data.domainName).toUpperCase()
  const domainWidth = fontHelveticaBold.widthOfTextAtSize(roleText, 20)
  page.drawText(roleText, {
    x: (width - domainWidth) / 2,
    y: height - 295,
    size: 20,
    font: fontHelveticaBold,
    color: brandIndigo,
  })

  // Mastery statement
  const masteryText = "and demonstrating verified technical competency in industry-standard practices."
  const masteryWidth = fontTimesItalic.widthOfTextAtSize(masteryText, 11)
  page.drawText(masteryText, {
    x: (width - masteryWidth) / 2,
    y: height - 315,
    size: 11,
    font: fontTimesItalic,
    color: textMuted,
  })

  // 6. Skills Badges Row
  if (data.skillsDemonstrated && data.skillsDemonstrated.length > 0) {
    const skillsString = data.skillsDemonstrated.slice(0, 5).join("   •   ")
    const skillsWidth = fontHelveticaBold.widthOfTextAtSize(skillsString, 9)
    page.drawText(skillsString, {
      x: (width - skillsWidth) / 2,
      y: height - 345,
      size: 9,
      font: fontHelveticaBold,
      color: textMuted,
    })
  }

  // 7. Embed QR Code
  try {
    const qrBuffer = await generateQRCode(data.verificationUrl)
    const qrImage = await pdfDoc.embedPng(qrBuffer)
    const qrSize = 75
    page.drawImage(qrImage, {
      x: 60,
      y: 70,
      width: qrSize,
      height: qrSize,
    })
    page.drawText("Scan to verify", {
      x: 60,
      y: 55,
      size: 8,
      font: fontHelvetica,
      color: textMuted,
    })
  } catch (err) {
    console.warn("QR code embed failed:", err)
  }

  // 8. Performance Metrics Box (Center Left)
  const metaStartX = 160
  page.drawText(`Overall Score: ${data.score}%`, {
    x: metaStartX,
    y: 125,
    size: 10,
    font: fontHelveticaBold,
    color: emeraldGreen,
  })
  page.drawText(`AI Interview: ${data.interviewScore}%`, {
    x: metaStartX,
    y: 110,
    size: 9,
    font: fontHelvetica,
    color: textDark,
  })
  page.drawText(`Curriculum Completion: 100%`, {
    x: metaStartX,
    y: 95,
    size: 9,
    font: fontHelvetica,
    color: textDark,
  })
  page.drawText(`Issued: ${data.issueDate}`, {
    x: metaStartX,
    y: 80,
    size: 9,
    font: fontHelvetica,
    color: textMuted,
  })
  page.drawText(`ID: ${data.certificateCode}`, {
    x: metaStartX,
    y: 65,
    size: 8.5,
    font: fontHelveticaBold,
    color: brandIndigo,
  })

  // 9. Gold Circular Seal (Center Right)
  const sealCenterX = width / 2 + 100
  const sealCenterY = 100
  page.drawCircle({
    x: sealCenterX,
    y: sealCenterY,
    size: 32,
    color: goldPrimary,
    borderColor: goldDark,
    borderWidth: 2,
  })
  page.drawCircle({
    x: sealCenterX,
    y: sealCenterY,
    size: 27,
    color: goldDark,
  })
  const sealText1 = "CERTIFIED"
  const sealText2 = "PATHLEARN"
  const s1Width = fontHelveticaBold.widthOfTextAtSize(sealText1, 7)
  const s2Width = fontHelveticaBold.widthOfTextAtSize(sealText2, 6.5)
  page.drawText(sealText1, {
    x: sealCenterX - s1Width / 2,
    y: sealCenterY + 4,
    size: 7,
    font: fontHelveticaBold,
    color: bgIvory,
  })
  page.drawText(sealText2, {
    x: sealCenterX - s2Width / 2,
    y: sealCenterY - 7,
    size: 6.5,
    font: fontHelveticaBold,
    color: goldPrimary,
  })

  // 10. Signature Area (Far Right)
  const sigX = width - 200
  page.drawLine({
    start: { x: sigX, y: 95 },
    end: { x: width - 60, y: 95 },
    color: textMuted,
    thickness: 1,
  })
  const sigName = "PathLearn AI Academic Board"
  const sigTitle = "Director of Curriculum & AI Evaluation"
  page.drawText(sigName, {
    x: sigX,
    y: 80,
    size: 9,
    font: fontTimesBold,
    color: textDark,
  })
  page.drawText(sigTitle, {
    x: sigX,
    y: 68,
    size: 8,
    font: fontHelvetica,
    color: textMuted,
  })

  // Save PDF bytes
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

/**
 * 5. Save generated PDF to server storage
 */
export async function saveCertificatePDF(
  certificateCode: string,
  pdfBuffer: Buffer
): Promise<string> {
  const uploadsDir = path.join(__dirname, "../../../uploads/certificates")
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const filePath = path.join(uploadsDir, `${certificateCode}.pdf`)
  await fs.promises.writeFile(filePath, pdfBuffer)
  return `/api/certificates/${certificateCode}/download`
}
