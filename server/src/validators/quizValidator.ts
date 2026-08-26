import { z } from "zod"

export const quizQuestionSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
})

export const aiQuizResponseSchema = z.object({
  questions: z.array(quizQuestionSchema).length(5),
})
