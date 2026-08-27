import { generateJSON } from "./aiService"
import { aiInterviewQuestionsSchema } from "../../validators/interviewValidator"

interface GenerateInterviewQuestionsParams {
  domainName: string
  type: string
  difficulty: string
  numQuestions: number
}

export async function generateInterviewQuestions(params: GenerateInterviewQuestionsParams) {
  const { domainName, type, difficulty, numQuestions } = params

  const typeGuidance: Record<string, string> = {
    TECHNICAL: "purely technical questions testing conceptual understanding and problem-solving",
    HR: "behavioral and HR-style questions about work style, teamwork, and communication",
    SCENARIO_BASED: "realistic workplace scenarios requiring the candidate to explain how they would investigate or resolve a problem",
    MIXED: "a balanced mix of theoretical, conceptual, coding/problem-solving, and scenario-based questions",
  }

  const prompt = `You are an experienced technical interviewer.

Domain: ${domainName}
Interview type: ${type} — generate ${typeGuidance[type]}
Difficulty: ${difficulty}

Generate exactly ${numQuestions} interview questions for this domain and type. Questions should escalate naturally in depth. Do not include answers.

Respond with ONLY valid JSON in this exact structure, no other text:

{
  "questions": ["string array of exactly ${numQuestions} interview questions"]
}`

  const rawResponse = await generateJSON(prompt)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    throw new Error("AI returned invalid JSON")
  }

  const validated = aiInterviewQuestionsSchema.safeParse(parsed)

  if (!validated.success) {
    throw new Error("AI interview questions failed validation: " + JSON.stringify(validated.error.flatten()))
  }

  return validated.data.questions
}
