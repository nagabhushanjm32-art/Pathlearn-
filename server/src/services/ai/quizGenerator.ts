import { generateJSON } from "./aiService"
import { aiQuizResponseSchema } from "../../validators/quizValidator"

interface GenerateQuizParams {
  stepTitle: string
  stepDescription: string
  learningObjectives: string[]
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string
}

export async function generateQuiz(params: GenerateQuizParams) {
  const { stepTitle, stepDescription, learningObjectives, difficulty } = params

  const prompt = `You are an expert technical assessment creator for software engineers and data scientists.

Topic: ${stepTitle}
Description: ${stepDescription}
Learning objectives covered: ${learningObjectives.join(", ")}
Difficulty level: ${difficulty}

Generate exactly 5 multiple-choice questions testing deep conceptual and practical understanding of this topic.
Each question must have exactly 4 options with exactly one correct answer (correctIndex between 0 and 3).

Respond with ONLY valid JSON in this exact structure, no markdown outside JSON:

{
  "questions": [
    {
      "question": "What is the primary role of ...?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why the selected option is correct.",
      "difficulty": "${difficulty === "ADVANCED" ? "ADVANCED" : difficulty === "INTERMEDIATE" ? "INTERMEDIATE" : "BEGINNER"}"
    }
  ]
}`

  try {
    const rawResponse = await generateJSON(prompt)
    let parsed: unknown
    try {
      const cleanJson = rawResponse.replace(/```json\s*|\s*```/g, "").trim()
      parsed = JSON.parse(cleanJson)
    } catch {
      throw new Error("AI returned invalid JSON")
    }

    const validated = aiQuizResponseSchema.safeParse(parsed)
    if (!validated.success) {
      console.warn("AI quiz validation warning:", validated.error.flatten())
      return getFallbackQuiz(params)
    }

    return validated.data.questions
  } catch (error) {
    console.error("AI quiz generation error, using curated template:", error)
    return getFallbackQuiz(params)
  }
}

function getFallbackQuiz(params: GenerateQuizParams) {
  const { stepTitle, difficulty } = params
  const diff = (difficulty === "ADVANCED" ? "ADVANCED" : difficulty === "INTERMEDIATE" ? "INTERMEDIATE" : "BEGINNER") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

  return [
    {
      question: `What is the core objective of ${stepTitle}?`,
      options: [
        `To understand and apply key architectural patterns for ${stepTitle}`,
        "To bypass automated verification pipelines",
        "To reduce server hardware memory to zero",
        "To replace standard relational schemas entirely",
      ],
      correctIndex: 0,
      explanation: `${stepTitle} provides core engineering capabilities and design patterns necessary for building robust production workflows.`,
      difficulty: diff,
    },
    {
      question: `Which of the following is considered a best practice when implementing ${stepTitle}?`,
      options: [
        "Hardcoding configuration parameters directly into production logic",
        "Writing modular, testable components with explicit state boundaries",
        "Ignoring input validation and error handling",
        "Disabling logging and monitoring across services",
      ],
      correctIndex: 1,
      explanation: "Modular architectures with decoupled state and comprehensive test coverage prevent production bugs and technical debt.",
      difficulty: diff,
    },
    {
      question: `In the context of ${stepTitle}, how should exceptions and edge cases typically be handled?`,
      options: [
        "By silently swallowing all exceptions with empty catch blocks",
        "By crashing the application process immediately without notification",
        "By utilizing structured error handling, logging, and graceful degradation",
        "By delegating error handling exclusively to client browsers",
      ],
      correctIndex: 2,
      explanation: "Graceful degradation combined with structured error tracking ensures system resilience and observability.",
      difficulty: diff,
    },
    {
      question: `How does ${stepTitle} typically impact system scalability and maintainability?`,
      options: [
        "It significantly increases technical debt without measurable benefit",
        "It improves maintainability by enforcing separation of concerns and clear interfaces",
        "It makes codebase refactoring impossible",
        "It forces all logic to run synchronously on a single CPU thread",
      ],
      correctIndex: 1,
      explanation: "Standardized separation of concerns allows components to scale independently and simplify team collaboration.",
      difficulty: diff,
    },
    {
      question: `What is a common technical interview question regarding ${stepTitle}?`,
      options: [
        "Explaining trade-offs between performance, complexity, and resource utilization",
        "Memorizing ASCII codes of programming keywords",
        "Describing the physical silicon architecture of 1980s microprocessors",
        "Listing keyboard shortcuts in a specific text editor",
      ],
      correctIndex: 0,
      explanation: "Senior technical interviewers focus heavily on system trade-offs, algorithmic complexity, and architectural decisions.",
      difficulty: diff,
    },
  ]
}
