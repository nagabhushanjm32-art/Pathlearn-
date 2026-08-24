import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authenticate"
import { generateRoadmap } from "../services/ai/roadmapGenerator"

export async function generateRoadmapForUser(req: AuthRequest, res: Response) {
  const { domainId } = req.body

  if (!domainId) {
    return res.status(400).json({ message: "domainId is required" })
  }

  try {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { userId_domainId: { userId: req.user!.userId, domainId } },
    })

    if (existingRoadmap) {
      return res.status(409).json({ message: "You already have a roadmap for this domain" })
    }

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })

    const steps = await generateRoadmap({
      domainName: domain.name,
      domainDescription: domain.description,
      level: profile?.level ?? null,
      goal: profile?.goal ?? null,
      studyTimePerDay: profile?.studyTimePerDay ?? null,
    })

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: req.user!.userId,
        domainId,
        steps: {
          create: steps.map((step, index) => ({
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
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    })

    return res.status(201).json({
      message: "Roadmap generated successfully",
      roadmap,
    })
  } catch (error) {
    console.error("GENERATE ROADMAP ERROR:", error)
    return res.status(500).json({ message: "Something went wrong generating your roadmap" })
  }
}

export async function getMyRoadmap(req: AuthRequest, res: Response) {
  const { domainId } = req.params

  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { userId_domainId: { userId: req.user!.userId, domainId } },
      include: { steps: { orderBy: { order: "asc" } } },
    })

    if (!roadmap) {
      return res.status(404).json({ message: "No roadmap found for this domain" })
    }

    return res.status(200).json({ roadmap })
  } catch (error) {
    console.error("GET ROADMAP ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching your roadmap" })
  }
}
