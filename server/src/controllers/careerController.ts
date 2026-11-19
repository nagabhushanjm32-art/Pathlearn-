import { Response } from "express"
import { AuthRequest } from "../middleware/authMiddleware"
import prisma from "../utils/prisma"
import {
  extractRawText,
  parseStructuredResumeData,
} from "../services/resumeParserService"
import {
  analyzeResumeWithAI,
  generateSkillGaps,
  calculateCareerReadiness,
  personalizeRoadmapForUser,
  getRecommendedProjects,
} from "../services/ai/careerAiService"

/**
 * 1. POST /api/career/resume/upload
 * Upload and parse resume (PDF or DOCX, max 10MB)
 */
export async function uploadResumeHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const file = (req as any).file

  if (!file) {
    return res.status(400).json({ message: "No resume file provided. Supported formats: PDF, DOCX (Max 10MB)." })
  }

  try {
    // 1. Extract raw text from buffer
    const rawText = await extractRawText(file.buffer, file.originalname, file.mimetype)

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ message: "Could not extract readable text from resume. Please ensure the file is not corrupted." })
    }

    // 2. Extract structured candidate information
    const parsedData = parseStructuredResumeData(rawText)

    // 3. Get or default target role
    const currentProfile = await prisma.careerProfile.findUnique({ where: { userId } })
    const targetRole = currentProfile?.targetRole || "AI Engineer"

    // 4. Run AI analysis
    const aiAnalysis = await analyzeResumeWithAI(parsedData, rawText, targetRole)

    // 5. Save/Replace ResumeAnalysis in PostgreSQL
    const resumeAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype || "application/pdf",
        parsedData: parsedData as any,
        aiAnalysis: aiAnalysis as any,
        resumeScore: aiAnalysis.resumeScore || 75,
      },
    })

    // 6. Upsert extracted UserSkills
    if (aiAnalysis.skills && Array.isArray(aiAnalysis.skills)) {
      for (const skill of aiAnalysis.skills) {
        if (!skill.name) continue
        await prisma.userSkill.upsert({
          where: {
            userId_name: {
              userId,
              name: skill.name,
            },
          },
          update: {
            level: skill.level || "Intermediate",
            confidence: skill.confidence || 0.85,
            category: skill.category || "TECHNICAL",
            source: "RESUME",
          },
          create: {
            userId,
            name: skill.name,
            level: skill.level || "Intermediate",
            confidence: skill.confidence || 0.85,
            category: skill.category || "TECHNICAL",
            source: "RESUME",
          },
        })
      }
    }

    // 7. Recalculate transparent readiness score & gaps
    const readiness = await calculateCareerReadiness(userId, targetRole)

    // 8. Update SkillGap table
    await prisma.skillGap.deleteMany({
      where: { userId, targetRole },
    })

    for (const gap of readiness.gaps) {
      await prisma.skillGap.create({
        data: {
          userId,
          targetRole,
          skillName: gap.skillName,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          matchPercentage: gap.matchPercentage,
          gapScore: gap.gapScore,
          status: gap.status,
          whyItMatters: gap.whyItMatters,
          recommendedTopics: gap.recommendedTopics,
          estimatedEffort: gap.estimatedEffort,
        },
      })
    }

    return res.status(200).json({
      message: "Resume uploaded and analyzed successfully.",
      resumeAnalysis: {
        id: resumeAnalysis.id,
        fileName: resumeAnalysis.fileName,
        fileSize: resumeAnalysis.fileSize,
        resumeScore: resumeAnalysis.resumeScore,
        parsedData,
        aiAnalysis,
        createdAt: resumeAnalysis.createdAt,
      },
      readiness: {
        score: readiness.overallReadiness,
        breakdown: readiness.breakdown,
      },
      targetRole,
    })
  } catch (error) {
    console.error("UPLOAD RESUME ERROR:", error)
    return res.status(500).json({ message: "Failed to process and analyze resume." })
  }
}

/**
 * 2. POST /api/career/resume/analyze
 * Re-analyze existing resume
 */
export async function analyzeResumeHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const latestResume = await prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    if (!latestResume) {
      return res.status(404).json({ message: "No uploaded resume found for analysis." })
    }

    const currentProfile = await prisma.careerProfile.findUnique({ where: { userId } })
    const targetRole = currentProfile?.targetRole || "AI Engineer"

    const rawText = JSON.stringify(latestResume.parsedData)
    const aiAnalysis = await analyzeResumeWithAI(latestResume.parsedData as any, rawText, targetRole)

    const updated = await prisma.resumeAnalysis.update({
      where: { id: latestResume.id },
      data: {
        aiAnalysis: aiAnalysis as any,
        resumeScore: aiAnalysis.resumeScore || 75,
      },
    })

    const readiness = await calculateCareerReadiness(userId, targetRole)

    return res.status(200).json({
      message: "Resume re-analysis complete.",
      resumeAnalysis: updated,
      readiness,
    })
  } catch (error) {
    console.error("ANALYZE RESUME ERROR:", error)
    return res.status(500).json({ message: "Failed to re-analyze resume." })
  }
}

/**
 * 3. GET /api/career/profile
 * Get full career profile, readiness, target role, stats, and resume status
 */
export async function getCareerProfileHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    // 1. Get or create career profile
    let careerProfile = await prisma.careerProfile.findUnique({
      where: { userId },
    })

    const targetRole = careerProfile?.targetRole || "AI Engineer"

    // 2. Fetch latest resume status
    const latestResume = await prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    // 3. User skills count
    const skills = await prisma.userSkill.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    // 4. Certificates count
    const certificatesCount = await prisma.certificate.count({
      where: { userId, status: "ACTIVE" },
    })

    // 5. Mock Interview stats
    const latestInterview = await prisma.mockInterview.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
    })

    // 6. Calculate transparent readiness
    const readiness = await calculateCareerReadiness(userId, targetRole)

    // Calculate overall profile completion percentage
    let completionPoints = 20 // Account created
    if (latestResume) completionPoints += 30
    if (skills.length >= 3) completionPoints += 20
    if (latestInterview) completionPoints += 15
    if (certificatesCount > 0) completionPoints += 15
    const profileCompletion = Math.min(100, completionPoints)

    return res.status(200).json({
      careerProfile: {
        id: careerProfile?.id || "temp",
        targetRole,
        readinessScore: readiness.overallReadiness,
        breakdown: readiness.breakdown,
        profileCompletion,
      },
      resumeStatus: latestResume
        ? {
            hasResume: true,
            id: latestResume.id,
            fileName: latestResume.fileName,
            fileSize: latestResume.fileSize,
            resumeScore: latestResume.resumeScore,
            uploadedAt: latestResume.createdAt,
            aiAnalysis: latestResume.aiAnalysis,
          }
        : {
            hasResume: false,
          },
      skills,
      stats: {
        skillsCount: skills.length,
        certificatesCount,
        interviewScore: latestInterview?.overallScore ?? 0,
        interviewPassed: (latestInterview?.overallScore ?? 0) >= 60,
      },
      gaps: readiness.gaps,
    })
  } catch (error) {
    console.error("GET CAREER PROFILE ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch career profile." })
  }
}

/**
 * 4. PUT /api/career/target-role
 * Update target role and recalculate skill gaps & readiness
 */
export async function updateTargetRoleHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const targetRole = (req.body.targetRole || "AI Engineer").trim()

  try {
    const readiness = await calculateCareerReadiness(userId, targetRole)

    // Update SkillGap table
    await prisma.skillGap.deleteMany({
      where: { userId, targetRole },
    })

    for (const gap of readiness.gaps) {
      await prisma.skillGap.create({
        data: {
          userId,
          targetRole,
          skillName: gap.skillName,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          matchPercentage: gap.matchPercentage,
          gapScore: gap.gapScore,
          status: gap.status,
          whyItMatters: gap.whyItMatters,
          recommendedTopics: gap.recommendedTopics,
          estimatedEffort: gap.estimatedEffort,
        },
      })
    }

    return res.status(200).json({
      message: `Target role successfully updated to ${targetRole}.`,
      targetRole,
      readiness: {
        score: readiness.overallReadiness,
        breakdown: readiness.breakdown,
      },
      skillGaps: readiness.gaps,
    })
  } catch (error) {
    console.error("UPDATE TARGET ROLE ERROR:", error)
    return res.status(500).json({ message: "Failed to update target role." })
  }
}

/**
 * 5. GET /api/career/skills
 * Get user skills
 */
export async function getUserSkillsHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const skills = await prisma.userSkill.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({ skills })
  } catch (error) {
    console.error("GET USER SKILLS ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch skills." })
  }
}

/**
 * 6. GET /api/career/skill-gaps
 * Get skill gaps for current target role
 */
export async function getSkillGapsHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const targetRoleQuery = req.query.targetRole as string | undefined

  try {
    const profile = await prisma.careerProfile.findUnique({ where: { userId } })
    const targetRole = targetRoleQuery || profile?.targetRole || "AI Engineer"

    const userSkills = await prisma.userSkill.findMany({ where: { userId } })
    const gaps = generateSkillGaps(userSkills, targetRole)

    return res.status(200).json({
      targetRole,
      skillGaps: gaps,
    })
  } catch (error) {
    console.error("GET SKILL GAPS ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch skill gaps." })
  }
}

/**
 * 7. POST /api/career/recommendations
 * Get project and topic recommendations
 */
export async function getRecommendationsHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const profile = await prisma.careerProfile.findUnique({ where: { userId } })
    const targetRole = profile?.targetRole || "AI Engineer"

    const projects = getRecommendedProjects(targetRole)
    const userSkills = await prisma.userSkill.findMany({ where: { userId } })
    const gaps = generateSkillGaps(userSkills, targetRole)
    const weakGaps = gaps.filter((g) => g.status === "NEEDS_IMPROVEMENT" || g.status === "MISSING")

    return res.status(200).json({
      targetRole,
      projects,
      prioritySkills: weakGaps.map((w) => w.skillName),
      weakGaps,
    })
  } catch (error) {
    console.error("GET RECOMMENDATIONS ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch recommendations." })
  }
}

/**
 * 8. POST /api/career/roadmap/personalize
 * Prioritize weak areas on user roadmap
 */
export async function personalizeRoadmapHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const targetRole = (req.body.targetRole || "AI Engineer") as string

  try {
    const result = await personalizeRoadmapForUser(userId, targetRole)
    return res.status(200).json(result)
  } catch (error) {
    console.error("PERSONALIZE ROADMAP ERROR:", error)
    return res.status(500).json({ message: "Failed to personalize roadmap." })
  }
}

/**
 * 9. GET /api/career/readiness
 * Get detailed readiness score breakdown and formula explanation
 */
export async function getCareerReadinessHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const profile = await prisma.careerProfile.findUnique({ where: { userId } })
    const targetRole = profile?.targetRole || "AI Engineer"

    const readiness = await calculateCareerReadiness(userId, targetRole)
    return res.status(200).json({
      targetRole,
      readinessScore: readiness.overallReadiness,
      breakdown: readiness.breakdown,
    })
  } catch (error) {
    console.error("GET CAREER READINESS ERROR:", error)
    return res.status(500).json({ message: "Failed to calculate career readiness." })
  }
}

/**
 * 10. POST /api/career/resume/improve
 * Get ATS keyword analysis, section checklist, and project bullet suggestions
 */
export async function improveResumeHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const resume = await prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    if (!resume) {
      return res.status(404).json({ message: "No uploaded resume found. Upload a resume first to see improvement suggestions." })
    }

    const aiAnalysis = resume.aiAnalysis as any

    return res.status(200).json({
      resumeScore: resume.resumeScore,
      sectionChecklist: aiAnalysis?.sectionChecklist || {
        contact: true,
        education: true,
        technicalSkills: true,
        projects: "GOOD",
        experience: "WARN",
        quantifiableAchievements: false,
      },
      atsKeywords: aiAnalysis?.atsKeywords || {
        matched: ["Python", "SQL"],
        missing: ["PyTorch", "Docker", "RAG"],
      },
      projectAnalyses: aiAnalysis?.projectAnalyses || [],
      careerInsights: aiAnalysis?.careerInsights || "Focus on measurable accomplishments and modern frameworks.",
    })
  } catch (error) {
    console.error("IMPROVE RESUME ERROR:", error)
    return res.status(500).json({ message: "Failed to retrieve resume improvement recommendations." })
  }
}

/**
 * 11. DELETE /api/career/resume
 * Securely delete resume and associated analysis
 */
export async function deleteResumeHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    await prisma.resumeAnalysis.deleteMany({
      where: { userId },
    })

    await prisma.userSkill.deleteMany({
      where: { userId, source: "RESUME" },
    })

    const profile = await prisma.careerProfile.findUnique({ where: { userId } })
    const targetRole = profile?.targetRole || "AI Engineer"
    const readiness = await calculateCareerReadiness(userId, targetRole)

    return res.status(200).json({
      message: "Resume and extracted skills removed successfully.",
      readiness,
    })
  } catch (error) {
    console.error("DELETE RESUME ERROR:", error)
    return res.status(500).json({ message: "Failed to delete resume." })
  }
}
