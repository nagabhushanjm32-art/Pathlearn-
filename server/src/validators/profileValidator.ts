import { z } from "zod"

export const onboardingSchema = z.object({
  targetRole: z.string().min(2, "Target role is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  goal: z.enum(["LEARN_FUNDAMENTALS", "INTERVIEW_PREP", "BUILD_PROJECTS", "JOB_READY"]),
  studyTimePerDay: z.enum(["THIRTY_MIN", "ONE_HOUR", "TWO_HOURS", "THREE_PLUS_HOURS"]),
})
