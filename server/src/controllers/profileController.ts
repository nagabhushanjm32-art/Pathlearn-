import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { onboardingSchema } from "../validators/profileValidator"
import { AuthRequest } from "../middleware/authenticate"
import { formatFullName } from "../utils/formatName"

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

/**
 * Update user profile details (Full Name, Target Role, Avatar, etc.)
 * PUT /api/profile or PATCH /api/profile
 */
export async function updateProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const { name, targetRole, avatarUrl, level, goal, studyTimePerDay } = req.body

  try {
    // 1. Update User name if provided
    if (typeof name === "string" && name.trim()) {
      const formattedName = formatFullName(name)
      await prisma.user.update({
        where: { id: userId },
        data: { name: formattedName },
      })
    }

    // 2. Prepare Profile updates
    const profileUpdates: any = {}
    if (typeof targetRole === "string") profileUpdates.targetRole = targetRole.trim()
    if (typeof avatarUrl === "string") profileUpdates.avatarUrl = avatarUrl.trim()
    if (level) profileUpdates.level = level
    if (goal) profileUpdates.goal = goal
    if (studyTimePerDay) profileUpdates.studyTimePerDay = studyTimePerDay

    // 3. Upsert profile so it's guaranteed to exist
    await prisma.profile.upsert({
      where: { userId },
      update: profileUpdates,
      create: {
        userId,
        targetRole: typeof targetRole === "string" ? targetRole.trim() : "AI / ML Engineer",
        ...profileUpdates,
      },
    })

    // 4. Return full updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            avatarUrl: true,
            targetRole: true,
            level: true,
            goal: true,
            studyTimePerDay: true,
            onboardingCompleted: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error)
    return res.status(500).json({ message: "Failed to update profile settings" })
  }
}

