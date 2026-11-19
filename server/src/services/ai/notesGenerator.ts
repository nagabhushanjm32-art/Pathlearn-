import { generateJSON } from "./aiService"
import { aiNotesResponseSchema, AiNotesResponse } from "../../validators/notesValidator"

interface GenerateNotesParams {
  stepTitle: string
  stepDescription: string
  learningObjectives: string[]
  skillsGained: string[]
  difficulty: string
}

export async function generateNotes(params: GenerateNotesParams): Promise<AiNotesResponse> {
  const { stepTitle, stepDescription, learningObjectives, skillsGained, difficulty } = params

  const prompt = `You are an expert technical educator creating structured, high-quality study notes for students.

Topic: ${stepTitle}
Description: ${stepDescription}
Learning objectives: ${learningObjectives.join(", ")}
Skills covered: ${skillsGained.join(", ")}
Difficulty: ${difficulty}

Generate concise, highly structured, beginner-to-intermediate friendly study notes adhering to these exact 7 sections:
1. What is it? (Simple explanation)
2. Key Concepts (List of 3-5 core concepts)
3. How it works (Step-by-step numbered explanation, 3-5 steps)
4. Important Terms (2-4 terms with simple 1-sentence explanations)
5. Example (Practical code or pseudocode example with concise explanation)
6. Key Takeaways (3-5 bullet points)
7. Interview Tip (1-2 sentences on how this is evaluated in tech interviews)

Respond with ONLY valid JSON in this exact structure, no markdown outside JSON, no explanation:

{
  "topic": "${stepTitle}",
  "whatIsIt": "A concise, clear explanation of what this topic is and why it matters.",
  "keyConcepts": [
    "Core concept 1 with brief context",
    "Core concept 2 with brief context",
    "Core concept 3 with brief context"
  ],
  "howItWorks": [
    "Step 1: Description of first stage",
    "Step 2: Description of second stage",
    "Step 3: Description of third stage"
  ],
  "importantTerms": [
    {
      "term": "Term 1",
      "explanation": "Clear definition of term 1"
    },
    {
      "term": "Term 2",
      "explanation": "Clear definition of term 2"
    }
  ],
  "example": {
    "code": "# Practical example code\ndef example_function():\n    pass",
    "language": "python",
    "explanation": "Explanation of how this example demonstrates the concept."
  },
  "keyTakeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "interviewTip": "Why and how this topic is commonly tested in technical interviews."
}`

  try {
    const rawResponse = await generateJSON(prompt)
    let parsed: unknown
    try {
      // Strip markdown code fences if model included them
      const cleanJson = rawResponse.replace(/```json\s*|\s*```/g, "").trim()
      parsed = JSON.parse(cleanJson)
    } catch {
      throw new Error("AI returned invalid JSON")
    }

    const validated = aiNotesResponseSchema.safeParse(parsed)
    if (!validated.success) {
      console.warn("AI notes validation warning:", validated.error.flatten())
      // If validation had minor issue, return fallback structured note
      return getFallbackNotes(params)
    }

    return validated.data
  } catch (error) {
    console.error("AI notes generation error, using curated template:", error)
    return getFallbackNotes(params)
  }
}

function getFallbackNotes(params: GenerateNotesParams): AiNotesResponse {
  const { stepTitle, stepDescription, learningObjectives, skillsGained } = params
  return {
    topic: stepTitle,
    whatIsIt: `${stepTitle} is a fundamental engineering topic. ${stepDescription}`,
    keyConcepts: skillsGained.length > 0 ? skillsGained : ["Core Principles", "Architecture Patterns", "Best Practices"],
    howItWorks: [
      `1. Initialize setup and environment for ${stepTitle}.`,
      `2. Execute core logic adhering to design specifications.`,
      `3. Validate outputs, verify edge cases, and optimize performance.`,
    ],
    importantTerms: [
      {
        term: stepTitle.split(" ")[0] || "Component",
        explanation: "The primary structural building block for this architectural layer.",
      },
      {
        term: "State & Flow",
        explanation: "How data and instructions move through the system during execution.",
      },
    ],
    example: {
      code: `# Example demonstrating ${stepTitle}\ndef execute_task(input_data):\n    \"\"\"Process input according to ${stepTitle} guidelines\"\"\"\n    result = process_data(input_data)\n    return result`,
      language: "python",
      explanation: `This demonstrates the standard implementation pattern for ${stepTitle}.`,
    },
    keyTakeaways: learningObjectives.length > 0 ? learningObjectives : [
      `Understand theoretical fundamentals of ${stepTitle}`,
      "Write clean, modular, and maintainable implementation code",
      "Prepare for common interview questions and architecture discussions",
    ],
    interviewTip: `When asked about ${stepTitle}, always explain the problem it solves first, then outline trade-offs and edge-case handling before writing code.`,
  }
}
