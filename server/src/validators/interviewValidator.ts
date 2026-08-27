import { z } from "zod"

export const startInterviewSchema = z.object({
  domainId: z.string(),
  type: z.enum(["TECHNICAL", "HR", "SCENARIO_BASED", "MIXED"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  numQuestions: z.number().int().min(5).max(8).default(6),
})

export const aiInterviewQuestionsSchema = z.object({
  questions: z.array(z.string().min(10)).min(5).max(8),
})

export const answerEvaluationSchema = z.object({
  questionIndex: z.number().int(),
  score: z.number().int().min(0).max(100),
  whatWasGood: z.string(),
  whatWasMissing: z.string(),
  idealDirection: z.string(),
  improvementTip: z.string(),
})

export const aiInterviewEvaluationSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  strongAreas: z.array(z.string()).min(1),
  weakAreas: z.array(z.string()).min(1),
  recommendation: z.string().min(10),
  answerEvaluations: z.array(answerEvaluationSchema),
})
