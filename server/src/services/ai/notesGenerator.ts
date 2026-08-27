import { generateJSON } from "./aiService"
import { aiNotesResponseSchema } from "../../validators/notesValidator"

interface GenerateNotesParams {
  stepTitle: string
  stepDescription: string
  learningObjectives: string[]
  skillsGained: string[]
  difficulty: string
}

export async function generateNotes(params: GenerateNotesParams) {
  const { stepTitle, stepDescription, learningObjectives, skillsGained, difficulty } = params

  const prompt = `You are an expert technical educator creating structured study notes.

Topic: ${stepTitle}
Description: ${stepDescription}
Learning objectives: ${learningObjectives.join(", ")}
Skills covered: ${skillsGained.join(", ")}
Difficulty: ${difficulty}

Generate comprehensive, well-organized study notes for this topic.

Respond with ONLY valid JSON in this exact structure, no other text:

{
  "summary": "string - a clear 2-4 sentence overview of the topic",
  "keyConcepts": ["string array of 3-6 core concepts, each as a short phrase"],
  "definitions": [{"term": "string", "definition": "string - 1 sentence clear definition"}],
  "examples": ["string array of 2-4 concrete examples or code-style illustrations of the concept in plain text"],
  "commonMistakes": ["string array of 2-4 common mistakes learners make with this topic"],
  "interviewTips": ["string array of 2-3 tips specific to how this topic is tested in technical interviews"],
  "quickRevision": ["string array of 4-6 short bullet points for fast pre-exam revision"],
  "takeaways": ["string array of exactly 5 important takeaways from this topic"]
}`

  const rawResponse = await generateJSON(prompt)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    throw new Error("AI returned invalid JSON")
  }

  const validated = aiNotesResponseSchema.safeParse(parsed)

  if (!validated.success) {
    throw new Error("AI notes response failed validation: " + JSON.stringify(validated.error.flatten()))
  }

  return validated.data
}
