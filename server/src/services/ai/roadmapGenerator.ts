import { generateJSON } from "./aiService"
import { aiRoadmapResponseSchema } from "../../validators/roadmapValidator"

interface GenerateRoadmapParams {
  domainName: string
  domainDescription: string
  level: string | null
  goal: string | null
  studyTimePerDay: string | null
}

export async function generateRoadmap(params: GenerateRoadmapParams) {
  const { domainName, domainDescription, level, goal, studyTimePerDay } = params

  const prompt = `You are an expert curriculum designer creating a personalized learning roadmap.

Domain: ${domainName}
Domain description: ${domainDescription}
Learner's current level: ${level || "not specified"}
Learner's goal: ${goal || "not specified"}
Learner's available study time: ${studyTimePerDay || "not specified"}

Generate a structured learning roadmap with 8 to 14 sequential steps/topics that take the learner from fundamentals to job-ready proficiency in this domain. Each step should build on the previous ones.

Respond with ONLY valid JSON in this exact structure, no other text:

{
  "steps": [
    {
      "title": "string - short topic title",
      "description": "string - 1-2 sentence description of what this step covers",
      "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      "estimatedMinutes": number,
      "prerequisites": ["string array of prior step titles this depends on, empty array if none"],
      "learningObjectives": ["string array of 2-4 specific things the learner will be able to do after this step"],
      "skillsGained": ["string array of 2-4 concrete skills"],
      "interviewRelevance": "string - 1 sentence on why this matters for technical interviews, or empty string"
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

  const validated = aiRoadmapResponseSchema.safeParse(parsed)

  if (!validated.success) {
    throw new Error("AI response failed validation: " + JSON.stringify(validated.error.flatten()))
  }

  return validated.data.steps
}
