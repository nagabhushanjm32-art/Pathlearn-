import { z } from "zod"

export const roadmapStepSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedMinutes: z.number().int().positive(),
  prerequisites: z.array(z.string()),
  learningObjectives: z.array(z.string()).min(1),
  skillsGained: z.array(z.string()).min(1),
  interviewRelevance: z.string().optional(),
})

export const aiRoadmapResponseSchema = z.object({
  steps: z.array(roadmapStepSchema).min(3),
})
