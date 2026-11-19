import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authMiddleware"

/**
 * POST /api/progress/:stepId/watch
 * Tracks video watch progress (0% - 100%). Automatically marks videoCompleted when >= 90%.
 */
export async function trackWatchProgress(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const stepId = req.params.stepId as string
  const { progress } = req.body

  if (typeof progress !== "number" || isNaN(progress)) {
    return res.status(400).json({ message: "progress must be a valid number between 0 and 100" })
  }

  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)))

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: {
        roadmap: true,
        quiz: {
          include: {
            attempts: {
              where: { userId },
              orderBy: { score: "desc" },
              take: 1,
            },
          },
        },
      },
    })

    if (!step) {
      return res.status(404).json({ message: "Roadmap step not found" })
    }

    // Find or create UserStepProgress
    let stepProgress = await prisma.userStepProgress.findUnique({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
    })

    const newVideoProgress = stepProgress
      ? Math.max(stepProgress.videoProgress, clampedProgress)
      : clampedProgress
    const videoCompleted = newVideoProgress >= 90
    const quizCompleted = stepProgress ? stepProgress.quizCompleted : false

    // Check if step completion conditions are satisfied
    // Step completes when video >= 90% AND (no quiz exists OR quiz passed)
    const hasQuiz = Boolean(step.quiz)
    const canCompleteStep = videoCompleted && (!hasQuiz || quizCompleted)

    if (!stepProgress) {
      stepProgress = await prisma.userStepProgress.create({
        data: {
          userId,
          stepId,
          videoProgress: newVideoProgress,
          videoStarted: true,
          videoCompleted,
          quizCompleted,
          stepCompleted: canCompleteStep,
          completedAt: canCompleteStep ? new Date() : null,
        },
      })
    } else {
      const shouldMarkCompleted = stepProgress.stepCompleted || canCompleteStep
      stepProgress = await prisma.userStepProgress.update({
        where: { id: stepProgress.id },
        data: {
          videoProgress: newVideoProgress,
          videoStarted: true,
          videoCompleted: videoCompleted || stepProgress.videoCompleted,
          stepCompleted: shouldMarkCompleted,
          completedAt:
            !stepProgress.stepCompleted && shouldMarkCompleted
              ? new Date()
              : stepProgress.completedAt,
        },
      })
    }

    // If step completed, update roadmapStep and unlock next step in roadmap
    if (stepProgress.stepCompleted) {
      await unlockNextStepAndRecalculate(userId, step.roadmapId, step.order, step.id)
    }

    return res.status(200).json({
      message: "Watch progress updated",
      stepProgress,
    })
  } catch (error) {
    console.error("TRACK WATCH PROGRESS ERROR:", error)
    return res.status(500).json({ message: "Failed to update watch progress" })
  }
}

/**
 * POST /api/progress/:stepId/complete
 * Manually or explicitly complete a step when requirements are satisfied
 */
export async function markStepComplete(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const stepId = req.params.stepId as string

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: {
        roadmap: true,
        quiz: {
          include: {
            attempts: {
              where: { userId },
              orderBy: { score: "desc" },
              take: 1,
            },
          },
        },
      },
    })

    if (!step) {
      return res.status(404).json({ message: "Step not found" })
    }

    if (step.isLocked) {
      return res.status(400).json({ message: "Cannot complete a locked step" })
    }

    // Find or create UserStepProgress
    const stepProgress = await prisma.userStepProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
      update: {
        stepCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        stepId,
        videoProgress: 100,
        videoStarted: true,
        videoCompleted: true,
        quizCompleted: true,
        stepCompleted: true,
        completedAt: new Date(),
      },
    })

    // Unlock next step and recalculate roadmap percentage
    await unlockNextStepAndRecalculate(userId, step.roadmapId, step.order, step.id)

    return res.status(200).json({
      message: "Step completed successfully",
      stepProgress,
    })
  } catch (error) {
    console.error("MARK STEP COMPLETE ERROR:", error)
    return res.status(500).json({ message: "Failed to mark step complete" })
  }
}

/**
 * GET /api/dashboard/stats & GET /api/profile/stats
 * Real user stats dynamically calculated from PostgreSQL
 */
export async function getDashboardStats(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    // 1. Completed lessons count
    const completedLessonsCount = await prisma.userStepProgress.count({
      where: {
        userId,
        stepCompleted: true,
      },
    })

    // 2. Quizzes passed count
    const quizzesPassedCount = await prisma.userStepProgress.count({
      where: {
        userId,
        quizCompleted: true,
      },
    })

    // 3. Certificates count
    const certificatesCount = await prisma.certificate.count({
      where: {
        userId,
        revoked: false,
      },
    })

    // 4. Calculate total steps and progress across all user roadmaps
    const userRoadmaps = await prisma.roadmap.findMany({
      where: { userId },
      include: {
        steps: true,
        domain: true,
      },
    })

    let totalStepsCount = 0
    for (const r of userRoadmaps) {
      totalStepsCount += r.steps.length
    }

    const overallProgress =
      totalStepsCount > 0 ? Math.round((completedLessonsCount / totalStepsCount) * 100) : 0

    // 5. Find the active "Continue Learning" step
    // Priority: Most recently updated unlocked & incomplete step, or first incomplete unlocked step
    let activeStep = null

    const inProgressStepProgress = await prisma.userStepProgress.findFirst({
      where: {
        userId,
        stepCompleted: false,
        step: {
          isLocked: false,
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        step: {
          include: {
            roadmap: {
              include: { domain: true },
            },
            videos: true,
          },
        },
      },
    })

    if (inProgressStepProgress && inProgressStepProgress.step) {
      const s = inProgressStepProgress.step
      activeStep = {
        stepId: s.id,
        stepOrder: s.order,
        stepTitle: s.title,
        stepDescription: s.description,
        domainName: s.roadmap.domain.name,
        domainSlug: s.roadmap.domain.slug,
        videoProgress: inProgressStepProgress.videoProgress,
        videoCompleted: inProgressStepProgress.videoCompleted,
        quizCompleted: inProgressStepProgress.quizCompleted,
        thumbnailUrl: s.videos[0]?.thumbnailUrl || "https://img.youtube.com/vi/kCc8FmEb1nY/hqdefault.jpg",
      }
    } else if (userRoadmaps.length > 0) {
      // Pick first unlocked incomplete step from most recently updated roadmap
      const latestRoadmap = userRoadmaps[0]
      const firstIncomplete = latestRoadmap.steps.find((st) => !st.isCompleted && !st.isLocked)
      if (firstIncomplete) {
        const video = await prisma.video.findFirst({ where: { roadmapStepId: firstIncomplete.id } })
        activeStep = {
          stepId: firstIncomplete.id,
          stepOrder: firstIncomplete.order,
          stepTitle: firstIncomplete.title,
          stepDescription: firstIncomplete.description,
          domainName: latestRoadmap.domain.name,
          domainSlug: latestRoadmap.domain.slug,
          videoProgress: 0,
          videoCompleted: false,
          quizCompleted: false,
          thumbnailUrl: video?.thumbnailUrl || "https://img.youtube.com/vi/kCc8FmEb1nY/hqdefault.jpg",
        }
      }
    }

    const stats = {
      lessonsCompleted: completedLessonsCount,
      quizzesPassed: quizzesPassedCount,
      overallProgress,
      certificatesEarned: certificatesCount,
      totalSteps: totalStepsCount,
      completedSteps: completedLessonsCount,
      streakDays: completedLessonsCount > 0 ? 1 : 0,
      activeStep,
    }

    return res.status(200).json({ stats })
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch dashboard stats" })
  }
}

/**
 * GET /api/dashboard/activity & GET /api/profile/activity
 */
export async function getRecentActivity(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    const recentStepProgresses = await prisma.userStepProgress.findMany({
      where: { userId, stepCompleted: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        step: {
          include: {
            roadmap: {
              include: { domain: true },
            },
          },
        },
      },
    })

    const activities = recentStepProgresses.map((sp) => ({
      id: `act-${sp.id}`,
      type: "LESSON_COMPLETED" as const,
      title: `Completed: ${sp.step.title}`,
      subtitle: sp.step.roadmap?.domain?.name || "Technical Roadmap",
      timestamp: sp.updatedAt.toISOString(),
      timeAgo: formatTimeAgo(sp.updatedAt),
      icon: "check-circle",
      status: "success" as const,
    }))

    return res.status(200).json({ activities })
  } catch (error) {
    console.error("GET RECENT ACTIVITY ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch recent activity" })
  }
}

/**
 * GET /api/certificates/:domainId/eligibility
 * Evaluates real-time certificate eligibility
 */
export async function getCertificateEligibility(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const domainId = req.params.domainId as string

  try {
    // Find domain by id or slug
    const domain = await prisma.domain.findFirst({
      where: {
        OR: [{ id: domainId }, { slug: domainId }],
      },
    })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    // 1. Check completed mock interview
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

    const mockInterviewScore = latestInterview?.overallScore ?? 0
    const mockInterviewPassed = mockInterviewScore >= 60

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

    if (!roadmap) {
      let requirementsMet = 0
      if (latestInterview) requirementsMet++
      if (mockInterviewPassed) requirementsMet++

      return res.status(200).json({
        eligibility: {
          domainSlug: domain.slug,
          domainName: domain.name,
          roadmapCompleted: false,
          roadmapProgress: 0,
          quizzesPassed: false,
          quizzesPassedCount: 0,
          totalQuizzesCount: 0,
          quizzesScoreRatio: "0/0",
          mockInterviewPassed,
          mockInterviewScore,
          isEligible: false,
          requirementsMetCount: requirementsMet,
          totalRequirementsCount: 4,
        },
      })
    }

    const stepIds = roadmap.steps.map((s) => s.id)
    const stepProgressList = await prisma.userStepProgress.findMany({
      where: {
        userId,
        stepId: { in: stepIds },
      },
    })

    const completedStepsCount = stepProgressList.filter((sp) => sp.stepCompleted).length
    const totalSteps = roadmap.steps.length
    const roadmapProgress = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0
    const roadmapCompleted = roadmapProgress >= 100

    // Quiz evaluation
    const stepsWithQuiz = roadmap.steps.filter((s) => s.quiz !== null)
    const totalQuizzes = stepsWithQuiz.length
    const passedQuizzesCount = stepProgressList.filter((sp) => sp.quizCompleted).length
    const quizzesPassed = totalQuizzes > 0 ? passedQuizzesCount >= totalQuizzes : true

    let requirementsMet = 0
    if (roadmapCompleted) requirementsMet++
    if (quizzesPassed && totalQuizzes > 0) requirementsMet++
    if (latestInterview) requirementsMet++
    if (mockInterviewPassed) requirementsMet++

    const isEligible = roadmapCompleted && quizzesPassed && mockInterviewPassed

    return res.status(200).json({
      eligibility: {
        domainSlug: domain.slug,
        domainName: domain.name,
        roadmapCompleted,
        roadmapProgress,
        quizzesPassed,
        quizzesPassedCount: passedQuizzesCount,
        totalQuizzesCount: totalQuizzes,
        quizzesScoreRatio: `${passedQuizzesCount}/${totalQuizzes}`,
        mockInterviewPassed,
        mockInterviewScore,
        isEligible,
        requirementsMetCount: requirementsMet,
        totalRequirementsCount: 4,
      },
    })
  } catch (error) {
    console.error("GET CERTIFICATE ELIGIBILITY ERROR:", error)
    return res.status(500).json({ message: "Failed to evaluate certificate eligibility" })
  }
}

/**
 * GET /api/progress/:domainId
 * Returns domain-specific progress breakdown for logged-in user
 */
export async function getDomainProgress(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const domainId = req.params.domainId as string

  try {
    const domain = await prisma.domain.findFirst({
      where: {
        OR: [{ id: domainId }, { slug: domainId }],
      },
    })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    const roadmap = await prisma.roadmap.findUnique({
      where: {
        userId_domainId: {
          userId,
          domainId: domain.id,
        },
      },
      include: {
        steps: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!roadmap) {
      return res.status(200).json({
        progress: {
          domainId: domain.id,
          domainSlug: domain.slug,
          domainName: domain.name,
          completedSteps: 0,
          totalSteps: 0,
          percentage: 0,
          steps: [],
        },
      })
    }

    const stepIds = roadmap.steps.map((s) => s.id)
    const stepProgresses = await prisma.userStepProgress.findMany({
      where: {
        userId,
        stepId: { in: stepIds },
      },
    })

    const progressMap = new Map<string, any>()
    for (const sp of stepProgresses) {
      progressMap.set(sp.stepId, sp)
    }

    const stepsWithProgress = roadmap.steps.map((s) => {
      const sp = progressMap.get(s.id)
      return {
        stepId: s.id,
        order: s.order,
        title: s.title,
        isCompleted: sp?.stepCompleted || s.isCompleted,
        videoProgress: sp?.videoProgress || 0,
        videoCompleted: sp?.videoCompleted || false,
        quizCompleted: sp?.quizCompleted || false,
        isLocked: s.isLocked,
      }
    })

    const completedStepsCount = stepsWithProgress.filter((s) => s.isCompleted).length
    const totalStepsCount = stepsWithProgress.length
    const percentage = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0

    return res.status(200).json({
      progress: {
        domainId: domain.id,
        domainSlug: domain.slug,
        domainName: domain.name,
        completedSteps: completedStepsCount,
        totalSteps: totalStepsCount,
        percentage,
        steps: stepsWithProgress,
      },
    })
  } catch (error) {
    console.error("GET DOMAIN PROGRESS ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch domain progress" })
  }
}

/**
 * Helper to unlock the next step in sequence and update roadmap progress
 */
async function unlockNextStepAndRecalculate(
  userId: string,
  roadmapId: string,
  currentOrder: number,
  currentStepId: string
) {
  // 1. Mark roadmap step complete
  await prisma.roadmapStep.update({
    where: { id: currentStepId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  })

  // 2. Unlock the next step if one exists
  const nextStep = await prisma.roadmapStep.findFirst({
    where: {
      roadmapId,
      order: currentOrder + 1,
    },
  })

  if (nextStep) {
    await prisma.roadmapStep.update({
      where: { id: nextStep.id },
      data: { isLocked: false },
    })
  }

  // 3. Recalculate roadmap progress
  const allSteps = await prisma.roadmapStep.findMany({
    where: { roadmapId },
  })

  const userProgresses = await prisma.userStepProgress.findMany({
    where: {
      userId,
      stepId: { in: allSteps.map((s) => s.id) },
      stepCompleted: true,
    },
  })

  const progressPct =
    allSteps.length > 0 ? Math.round((userProgresses.length / allSteps.length) * 100) : 0

  const updatedRoadmap = await prisma.roadmap.update({
    where: { id: roadmapId },
    data: { progress: progressPct },
    include: { domain: true },
  })

  // 4. Update user domain progress table
  await prisma.userProgress.upsert({
    where: {
      userId_domainId: {
        userId,
        domainId: updatedRoadmap.domainId,
      },
    },
    update: {
      percentage: progressPct,
    },
    create: {
      userId,
      domainId: updatedRoadmap.domainId,
      percentage: progressPct,
    },
  })
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
