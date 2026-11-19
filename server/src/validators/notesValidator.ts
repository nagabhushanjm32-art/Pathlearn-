import { z } from "zod"

export const aiNotesResponseSchema = z.object({
  topic: z.string().optional(),
  whatIsIt: z.string().min(10),
  keyConcepts: z.array(z.string()).min(2),
  howItWorks: z.array(z.string()).min(2),
  importantTerms: z.array(
    z.object({
      term: z.string(),
      explanation: z.string(),
    })
  ).min(1),
  example: z.object({
    code: z.string(),
    language: z.string().default("python"),
    explanation: z.string(),
  }),
  keyTakeaways: z.array(z.string()).min(2),
  interviewTip: z.string().min(10),
})

export type AiNotesResponse = z.infer<typeof aiNotesResponseSchema>
