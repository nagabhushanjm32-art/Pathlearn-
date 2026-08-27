import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authenticate"
import { generateNotes } from "../services/ai/notesGenerator"

export async function getOrGenerateNotes(req: AuthRequest, res: Response) {
  const { stepId } = req.params

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: { roadmap: true, notes: true },
    })

    if (!step) {
      return res.status(404).json({ message: "Step not found" })
    }

    if (step.roadmap.userId !== req.user!.userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    if (step.notes.length > 0) {
      return res.status(200).json({ note: step.notes[0] })
    }

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
        content,
      },
    })

    return res.status(201).json({ note })
  } catch (error) {
    console.error("GENERATE NOTES ERROR:", error)
    return res.status(500).json({ message: "Something went wrong generating notes" })
  }
}
