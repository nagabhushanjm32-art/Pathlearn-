import { generateJSON } from "./aiService"
import { aiInterviewEvaluationSchema } from "../../validators/interviewValidator"

interface QAPair {
  question: string
  answer: string
}

interface EvaluateInterviewParams {
  domainName: string
  type: string
  qaPairs: QAPair[]
}

export async function evaluateInterview(params: EvaluateInterviewParams) {
  const { domainName, type, qaPairs } = params

  const transcript = qaPairs
    .map((qa, i) => `Question ${i + 1}: ${qa.question}\nCandidate's Answer: ${qa.answer || "(no answer provided)"}`)
    .join("\n\n")

  const prompt = `You are an expert technical interviewer evaluating a completed ${type} interview for a ${domainName} role.

Full interview transcript:

${transcript}

Evaluate the candidate's overall performance and each individual answer. Consider technical correctness, relevance, clarity, depth, reasoning, examples, and communication.

Respond with ONLY valid JSON in this exact structure, no other text:

{
  "overallScore": number (0-100),
  "strongAreas": ["string array of 2-4 specific strengths demonstrated"],
  "weakAreas": ["string array of 2-4 specific areas needing improvement"],
  "recommendation": "string - 1-2 sentences of actionable advice for next steps",
  "answerEvaluations": [
    {
      "questionIndex": number (0-based index matching the question order above),
      "score": number (0-100),
      "whatWasGood": "string - what the candidate did well in this answer",
      "whatWasMissing": "string - what was missing or could be improved",
      "idealDirection": "string - brief guidance on the ideal answer direction, not a full model answer",
      "improvementTip": "string - one specific actionable tip"
    }
  ]
}

Include exactly ${qaPairs.length} entries in answerEvaluations, one per question, in order.`

  const rawResponse = await generateJSON(prompt)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawResponse)
  } catch {
    throw new Error("AI returned invalid JSON")
  }

  const validated = aiInterviewEvaluationSchema.safeParse(parsed)

  if (!validated.success) {
    throw new Error("AI interview evaluation failed validation: " + JSON.stringify(validated.error.flatten()))
  }

  return validated.data
}
