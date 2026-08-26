import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authenticate"

export async function completeStep(req: AuthRequest, res: Response) {
  const { stepId } = req.params

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: { roadmap: true },
    })

    if (!step) {
      return res.status(404).json({ message: "Step not found" })
    }

    if (step.roadmap.userId !== req.user!.userId) {
      return res.status(403).json({ message: "Not authorized to modify this roadmap" })
    }

    if (step.isLocked) {
      return res.status(400).json({ message: "This step is locked" })
    }

    await prisma.roadmapStep.update({
      where: { id: stepId },
      data: { isCompleted: true, completedAt: new Date() },
    })

    const nextStep = await prisma.roadmapStep.findFirst({
      where: { roadmapId: step.roadmapId, order: step.order + 1 },
    })

    if (nextStep) {
      await prisma.roadmapStep.update({
        where: { id: nextStep.id },
        data: { isLocked: false },
      })
    }

    const allSteps = await prisma.roadmapStep.findMany({
      where: { roadmapId: step.roadmapId },
    })
    const completedCount = allSteps.filter((s) => s.isCompleted || s.id === stepId).length
    const progress = (completedCount / allSteps.length) * 100

    await prisma.roadmap.update({
      where: { id: step.roadmapId },
      data: { progress },
    })

    const updatedRoadmap = await prisma.roadmap.findUnique({
      where: { id: step.roadmapId },
      include: { steps: { orderBy: { order: "asc" } } },
    })

    return res.status(200).json({
      message: "Step marked complete",
      roadmap: updatedRoadmap,
    })
  } catch (error) {
    console.error("COMPLETE STEP ERROR:", error)
    return res.status(500).json({ message: "Something went wrong completing this step" })
  }
}
