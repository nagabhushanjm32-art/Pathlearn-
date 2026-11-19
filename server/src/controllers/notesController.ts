import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authMiddleware"
import { generateNotes } from "../services/ai/notesGenerator"

/**
 * GET /api/notes/steps/:stepId or GET /api/steps/:stepId/notes
 * Returns cached 7-section study notes or generates and persists them
 */
export async function getOrGenerateNotes(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const stepId = req.params.stepId as string

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: { roadmap: true, notes: true },
    })

    if (!step) {
      return res.status(404).json({ message: "Step not found" })
    }

    // Check if notes already exist in database
    if (step.notes && step.notes.length > 0) {
      return res.status(200).json({ note: step.notes[0] })
    }

    // Generate structured 7-section notes
    const content = await generateNotes({
      stepTitle: step.title,
      stepDescription: step.description,
      learningObjectives: step.learningObjectives,
      skillsGained: step.skillsGained,
      difficulty: step.difficulty,
    })

    const note = await prisma.note.create({
      data: {
        roadmapStepId: stepId,
        content: content as any,
      },
    })

    return res.status(201).json({ note })
  } catch (error) {
    console.error("GENERATE NOTES ERROR:", error)
    return res.status(500).json({ message: "Something went wrong generating notes" })
  }
}
