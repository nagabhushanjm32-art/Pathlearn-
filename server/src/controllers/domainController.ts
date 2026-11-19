import { Request, Response } from "express"
import prisma from "../utils/prisma"
import { verifyToken } from "../utils/jwt"

export async function getAllDomains(req: Request, res: Response) {
  try {
    // Optional user authentication extraction
    let userId: string | null = null
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null)
    if (token) {
      try {
        const decoded = verifyToken(token)
        userId = decoded.userId
      } catch {
        // Token invalid/expired - continue as unauthenticated
      }
    }

    const domains = await prisma.domain.findMany({
      orderBy: { name: "asc" },
      include: userId
        ? {
            roadmaps: {
              where: { userId },
              include: {
                steps: {
                  select: { id: true, isCompleted: true },
                },
              },
            },
          }
        : undefined,
    })

    // Fetch user step progress for all steps if user is logged in
    let completedStepIds = new Set<string>()
    if (userId) {
      const stepProgresses = await prisma.userStepProgress.findMany({
        where: { userId, stepCompleted: true },
        select: { stepId: true },
      })
      completedStepIds = new Set(stepProgresses.map((sp) => sp.stepId))
    }

    const formattedDomains = domains.map((domain: any) => {
      const userRoadmap = domain.roadmaps?.[0]
      const totalSteps = userRoadmap?.steps?.length || 12
      let completedSteps = 0

      if (userRoadmap && userRoadmap.steps) {
        completedSteps = userRoadmap.steps.filter((s: any) => completedStepIds.has(s.id) || s.isCompleted).length
      }

      const progress = totalSteps > 0 && completedSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

      return {
        id: domain.id,
        slug: domain.slug,
        name: domain.name,
        description: domain.description,
        icon: domain.icon || "Brain",
        difficulty: domain.difficulty,
        estimatedDays: domain.estimatedDays,
        progress,
        totalSteps,
        completedSteps,
        skillTags: domain.skillTags,
        targetRoles: domain.skillTags.slice(0, 3),
      }
    })

    return res.status(200).json({ domains: formattedDomains })
  } catch (error) {
    console.error("GET DOMAINS ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching domains" })
  }
}

export async function getDomainById(req: Request, res: Response) {
  try {
    const identifier = req.params.id as string
    const domain = await prisma.domain.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    return res.status(200).json({ domain })
  } catch (error) {
    console.error("GET DOMAIN BY ID ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching the domain" })
  }
}
