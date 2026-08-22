import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { onboardingSchema } from "../validators/profileValidator"
import { AuthRequest } from "../middleware/authenticate"

export async function completeOnboarding(req: AuthRequest, res: Response) {
  const parsed = onboardingSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const { targetRole, level, goal, studyTimePerDay } = parsed.data

  try {
    const profile = await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: {
        targetRole,
        level,
        goal,
        studyTimePerDay,
        onboardingCompleted: true,
      },
    })

    return res.status(200).json({
      message: "Onboarding completed successfully",
      profile,
    })
  } catch (error) {
    console.error("ONBOARDING ERROR DETAILS:", error)
    return res.status(500).json({ message: "Something went wrong saving your preferences" })
  }
}
