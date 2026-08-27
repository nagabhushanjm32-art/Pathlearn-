import { z } from "zod"

export const aiNotesResponseSchema = z.object({
  summary: z.string().min(20),
  keyConcepts: z.array(z.string()).min(2),
  definitions: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })).min(1),
  examples: z.array(z.string()).min(1),
  commonMistakes: z.array(z.string()).min(1),
  interviewTips: z.array(z.string()).min(1),
  quickRevision: z.array(z.string()).min(1),
  takeaways: z.array(z.string()).length(5),
})
