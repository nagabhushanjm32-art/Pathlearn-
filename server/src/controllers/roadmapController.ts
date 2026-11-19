import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authMiddleware"
import { generateRoadmap } from "../services/ai/roadmapGenerator"
import { searchEducationalVideo } from "../services/youtubeService"

/**
 * Helper to resolve domain by ID or Slug
 */
async function resolveDomain(domainIdentifier: string) {
  return await prisma.domain.findFirst({
    where: {
      OR: [{ id: domainIdentifier }, { slug: domainIdentifier }],
    },
  })
}

/**
 * POST /api/roadmaps/generate or POST /api/domains/:id/generate-roadmap
 */
export async function generateRoadmapForUser(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const domainIdentifier = (req.body.domainId || req.params.domainId || req.params.id) as string

  if (!domainIdentifier) {
    return res.status(400).json({ message: "domainId or domain slug is required" })
  }

  try {
    const domain = await resolveDomain(domainIdentifier)
    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    // Check if roadmap already exists for user
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: {
        userId_domainId: {
          userId,
          domainId: domain.id,
        },
      },
      include: {
        domain: true,
        steps: {
          orderBy: { order: "asc" },
          include: {
            videos: true,
            resources: true,
            quiz: true,
          },
        },
      },
    })

    if (existingRoadmap) {
      const formattedRoadmap = await formatRoadmapWithUserProgress(userId, existingRoadmap)
      return res.status(200).json({
        message: "Existing roadmap retrieved",
        roadmap: formattedRoadmap,
      })
    }

    // Generate steps via AI service
    const profile = await prisma.profile.findUnique({ where: { userId } })
    const generatedSteps = await generateRoadmap({
      domainName: domain.name,
      domainDescription: domain.description,
      level: profile?.level ?? null,
      goal: profile?.goal ?? null,
      studyTimePerDay: profile?.studyTimePerDay ?? null,
    })

    // Create roadmap in DB
    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        domainId: domain.id,
        progress: 0,
        steps: {
          create: generatedSteps.map((step, index) => ({
            order: index + 1,
            title: step.title,
            description: step.description,
            difficulty: step.difficulty,
            estimatedMinutes: step.estimatedMinutes,
            prerequisites: step.prerequisites,
            learningObjectives: step.learningObjectives,
            skillsGained: step.skillsGained,
            interviewRelevance: step.interviewRelevance || null,
            isLocked: index !== 0,
            isCompleted: false,
          })),
        },
      },
      include: {
        domain: true,
        steps: {
          orderBy: { order: "asc" },
        },
      },
    })

    // Attach educational YouTube videos to each step
    for (const step of roadmap.steps) {
      const videoData = await searchEducationalVideo(step.title, domain.name)
      await prisma.video.create({
        data: {
          roadmapStepId: step.id,
          youtubeId: videoData.youtubeId,
          title: videoData.title,
          channel: videoData.channel,
          thumbnailUrl: videoData.thumbnailUrl,
          durationSecs: videoData.durationSecs,
          url: videoData.url,
        },
      })
    }

    // Initialize user domain progress
    await prisma.userProgress.upsert({
      where: {
        userId_domainId: {
          userId,
          domainId: domain.id,
        },
      },
      update: { percentage: 0 },
      create: {
        userId,
        domainId: domain.id,
        percentage: 0,
      },
    })

    const fullRoadmap = await prisma.roadmap.findUnique({
      where: { id: roadmap.id },
      include: {
        domain: true,
        steps: {
          orderBy: { order: "asc" },
          include: {
            videos: true,
            resources: true,
            quiz: true,
          },
        },
      },
    })

    const formattedRoadmap = await formatRoadmapWithUserProgress(userId, fullRoadmap!)

    return res.status(201).json({
      message: "Roadmap generated successfully",
      roadmap: formattedRoadmap,
    })
  } catch (error) {
    console.error("GENERATE ROADMAP ERROR:", error)
    return res.status(500).json({ message: "Something went wrong generating your roadmap" })
  }
}

/**
 * GET /api/roadmaps/:domainId or GET /api/domains/:id/roadmap
 */
export async function getMyRoadmap(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const domainIdentifier = (req.params.domainId || req.params.id) as string

  try {
    const domain = await resolveDomain(domainIdentifier)
    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    let roadmap = await prisma.roadmap.findUnique({
      where: {
        userId_domainId: {
          userId,
          domainId: domain.id,
        },
      },
      include: {
        domain: true,
        steps: {
          orderBy: { order: "asc" },
          include: {
            videos: true,
            resources: true,
            quiz: true,
          },
        },
      },
    })

    // If roadmap doesn't exist yet for this user, automatically generate it
    if (!roadmap) {
      const profile = await prisma.profile.findUnique({ where: { userId } })
      const generatedSteps = await generateRoadmap({
        domainName: domain.name,
        domainDescription: domain.description,
        level: profile?.level ?? null,
        goal: profile?.goal ?? null,
        studyTimePerDay: profile?.studyTimePerDay ?? null,
      })

      roadmap = await prisma.roadmap.create({
        data: {
          userId,
          domainId: domain.id,
          progress: 0,
          steps: {
            create: generatedSteps.map((step, index) => ({
              order: index + 1,
              title: step.title,
              description: step.description,
              difficulty: step.difficulty,
              estimatedMinutes: step.estimatedMinutes,
              prerequisites: step.prerequisites,
              learningObjectives: step.learningObjectives,
              skillsGained: step.skillsGained,
              interviewRelevance: step.interviewRelevance || null,
              isLocked: index !== 0,
              isCompleted: false,
            })),
          },
        },
        include: {
          domain: true,
          steps: {
            orderBy: { order: "asc" },
            include: {
              videos: true,
              resources: true,
              quiz: true,
            },
          },
        },
      })

      // Attach videos to steps
      for (const step of roadmap.steps) {
        const videoData = await searchEducationalVideo(step.title, domain.name)
        await prisma.video.create({
          data: {
            roadmapStepId: step.id,
            youtubeId: videoData.youtubeId,
            title: videoData.title,
            channel: videoData.channel,
            thumbnailUrl: videoData.thumbnailUrl,
            durationSecs: videoData.durationSecs,
            url: videoData.url,
          },
        })
      }

      // Re-fetch with videos
      roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmap.id },
        include: {
          domain: true,
          steps: {
            orderBy: { order: "asc" },
            include: {
              videos: true,
              resources: true,
              quiz: true,
            },
          },
        },
      })
    }

    const formattedRoadmap = await formatRoadmapWithUserProgress(userId, roadmap!)
    return res.status(200).json({ roadmap: formattedRoadmap })
  } catch (error) {
    console.error("GET ROADMAP ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching your roadmap" })
  }
}

/**
 * GET /api/steps/:stepId or GET /api/roadmaps/steps/:stepId
 * Returns complete step details for the dedicated /learn/:stepId page
 */
export async function getStepById(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const stepId = req.params.stepId as string

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: {
        roadmap: {
          include: {
            domain: true,
            steps: {
              orderBy: { order: "asc" },
              select: { id: true, order: true, title: true, isLocked: true },
            },
          },
        },
        videos: true,
        resources: true,
        notes: true,
        quiz: {
          include: {
            questions: true,
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

    // Ensure step has a video
    let video = step.videos[0]
    if (!video) {
      const videoData = await searchEducationalVideo(step.title, step.roadmap.domain.name)
      video = await prisma.video.create({
        data: {
          roadmapStepId: step.id,
          youtubeId: videoData.youtubeId,
          title: videoData.title,
          channel: videoData.channel,
          thumbnailUrl: videoData.thumbnailUrl,
          durationSecs: videoData.durationSecs,
          url: videoData.url,
        },
      })
    }

    // Get user's step progress record
    const userStepProgress = await prisma.userStepProgress.findUnique({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
    })

    // Find next step in roadmap
    const nextStep = step.roadmap.steps.find((s) => s.order === step.order + 1) || null
    const prevStep = step.roadmap.steps.find((s) => s.order === step.order - 1) || null

    const formattedStep = {
      id: step.id,
      roadmapId: step.roadmapId,
      domainId: step.roadmap.domain.id,
      domainName: step.roadmap.domain.name,
      domainSlug: step.roadmap.domain.slug,
      order: step.order,
      title: step.title,
      description: step.description,
      difficulty: step.difficulty,
      estimatedMinutes: step.estimatedMinutes,
      prerequisites: step.prerequisites,
      learningObjectives: step.learningObjectives,
      skillsGained: step.skillsGained,
      interviewRelevance: step.interviewRelevance,
      isLocked: step.isLocked,
      isCompleted: userStepProgress?.stepCompleted || step.isCompleted,
      videoProgress: userStepProgress?.videoProgress || 0,
      videoStarted: userStepProgress?.videoStarted || false,
      videoCompleted: userStepProgress?.videoCompleted || false,
      quizCompleted: userStepProgress?.quizCompleted || false,
      video: {
        id: video.id,
        youtubeId: video.youtubeId,
        title: video.title,
        channel: video.channel,
        thumbnailUrl: video.thumbnailUrl,
        durationSecs: video.durationSecs,
        url: video.url,
      },
      resources: step.resources,
      nextStepId: nextStep ? nextStep.id : null,
      prevStepId: prevStep ? prevStep.id : null,
      totalStepsInRoadmap: step.roadmap.steps.length,
    }

    return res.status(200).json({ step: formattedStep })
  } catch (error) {
    console.error("GET STEP BY ID ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch step details" })
  }
}

/**
 * GET /api/steps/:stepId/resources
 */
export async function getStepResources(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const stepId = req.params.stepId as string

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: {
        videos: true,
        resources: true,
        roadmap: {
          include: { domain: true },
        },
      },
    })

    if (!step) {
      return res.status(404).json({ message: "Step not found" })
    }

    return res.status(200).json({
      stepId: step.id,
      stepTitle: step.title,
      videos: step.videos,
      resources: step.resources,
    })
  } catch (error) {
    console.error("GET STEP RESOURCES ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch step resources" })
  }
}

/**
 * Format raw roadmap with user-specific step progress
 */
async function formatRoadmapWithUserProgress(userId: string, roadmap: any) {
  const stepIds = roadmap.steps.map((s: any) => s.id)
  const userProgresses = await prisma.userStepProgress.findMany({
    where: {
      userId,
      stepId: { in: stepIds },
    },
  })

  const progressMap = new Map<string, any>()
  for (const up of userProgresses) {
    progressMap.set(up.stepId, up)
  }

  let completedStepsCount = 0
  const allSkills = new Set<string>()

  const formattedSteps = roadmap.steps.map((step: any, index: number) => {
    const up = progressMap.get(step.id)
    const isCompleted = up?.stepCompleted || step.isCompleted
    if (isCompleted) completedStepsCount++

    step.skillsGained.forEach((skill: string) => allSkills.add(skill))

    const video = step.videos?.[0]
    const videoProgress = up?.videoProgress || 0

    return {
      id: step.id,
      order: step.order,
      title: step.title,
      description: step.description,
      difficulty: step.difficulty,
      estimatedMinutes: step.estimatedMinutes,
      skillsGained: step.skillsGained,
      prerequisites: step.prerequisites,
      learningObjectives: step.learningObjectives,
      interviewRelevance: step.interviewRelevance,
      isCompleted,
      isLocked: step.isLocked && index !== 0 && !isCompleted,
      isCurrent: !isCompleted && !step.isLocked,
      videoProgress,
      videoStarted: up?.videoStarted || false,
      videoCompleted: up?.videoCompleted || false,
      quizCompleted: up?.quizCompleted || false,
      thumbnailUrl: video?.thumbnailUrl || `https://img.youtube.com/vi/${video?.youtubeId || "kCc8FmEb1nY"}/hqdefault.jpg`,
      videoUrl: video?.url || `https://www.youtube.com/watch?v=${video?.youtubeId || "kCc8FmEb1nY"}`,
      videoDuration: video?.durationSecs ? `${Math.round(video.durationSecs / 60)} min` : undefined,
      videoChannel: video?.channel,
    }
  })

  const totalSteps = formattedSteps.length
  const progressPercentage =
    totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0

  return {
    id: roadmap.id,
    domainId: roadmap.domain.id,
    domainName: roadmap.domain.name,
    domainSlug: roadmap.domain.slug,
    domainDescription: roadmap.domain.description,
    icon: roadmap.domain.icon || "Brain",
    targetRoles: roadmap.domain.skillTags.slice(0, 3),
    progress: progressPercentage,
    totalSteps,
    completedSteps: completedStepsCount,
    skillsCount: allSkills.size,
    skills: Array.from(allSkills),
    steps: formattedSteps,
  }
}
