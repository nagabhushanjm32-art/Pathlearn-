import { generateJSON } from "./aiService"
import { aiQuizResponseSchema } from "../../validators/quizValidator"

interface GenerateQuizParams {
  stepTitle: string
  stepDescription: string
  learningObjectives: string[]
  difficulty: string
}

export async function generateQuiz(params: GenerateQuizParams) {
  const { stepTitle, stepDescription, learningObjectives, difficulty } = params

  const prompt = `You are an expert technical assessment creator.

Topic: ${stepTitle}
Description: ${stepDescription}
Learning objectives covered: ${learningObjectives.join(", ")}
Difficulty level: ${difficulty}

Generate exactly 5 multiple-choice questions testing understanding of this topic. Mix conceptual and applied questions. Each question must have exactly 4 options with exactly one correct answer.

Respond with ONLY valid JSON in this exact structure, no other text:

{
  "questions": [
    {
      "question": "string - the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "string - why the correct answer is correct, 1-2 sentences",
      "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    }
  ]
}`

  const rawResponse = await generateJSON(prompt)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    throw new Error("AI returned invalid JSON")
  }

  const validated = aiQuizResponseSchema.safeParse(parsed)

  if (!validated.success) {
    throw new Error("AI quiz response failed validation: " + JSON.stringify(validated.error.flatten()))
  }

  return validated.data.questions
}
