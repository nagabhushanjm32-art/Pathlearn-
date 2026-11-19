import { z } from "zod"
import { generateJSON } from "./aiService"

// ZOD SCHEMAS FOR STRUCTURED RESPONSES
export const FirstQuestionSchema = z.object({
  question: z.string().min(10),
  topic: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  questionType: z
    .enum([
      "conceptual",
      "practical",
      "scenario",
      "debugging",
      "system_design",
      "project_based",
      "problem_solving",
    ])
    .default("conceptual"),
})

export const AnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  correctness: z.number().min(0).max(100),
  technicalDepth: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  knowledgeLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingConcepts: z.array(z.string()).default([]),
  feedback: z.string().min(5),
})

export const NextQuestionSchema = z.object({
  question: z.string().min(10),
  topic: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  questionType: z
    .enum([
      "conceptual",
      "practical",
      "scenario",
      "debugging",
      "system_design",
      "project_based",
      "problem_solving",
    ])
    .default("scenario"),
})

export const FinalEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  practicalScore: z.number().min(0).max(100),
  conceptualScore: z.number().min(0).max(100),
  readinessLevel: z.string().default("Intermediate"),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendedTopics: z.array(z.string()).default([]),
  recommendation: z.string().min(10),
})

export type FirstQuestion = z.infer<typeof FirstQuestionSchema>
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>
export type NextQuestion = z.infer<typeof NextQuestionSchema>
export type FinalEvaluation = z.infer<typeof FinalEvaluationSchema>

export interface PreviousQAItem {
  order: number
  question: string
  topic?: string | null
  difficulty?: string | null
  questionType?: string | null
  answer?: string | null
  score?: number | null
  feedback?: string | null
  technicalDepth?: number | null
  clarity?: number | null
  missingConcepts?: string[]
}

// 1. GENERATE FIRST QUESTION
export async function generateFirstQuestion(params: {
  domainName: string
  roadmapTopics?: string[]
  targetRole?: string
  difficulty?: string
}): Promise<FirstQuestion> {
  const { domainName, roadmapTopics = [], targetRole = "Engineer", difficulty = "medium" } = params

  const systemPrompt = `You are a Principal AI Technical Interviewer at a top-tier tech firm conducting a professional mock interview for a ${domainName} candidate aiming for a ${targetRole} role.
Your goal is to assess their real technical mastery, problem-solving, architectural decision-making, and communication.
Generate a realistic, articulate, and engaging opening technical interview question.`

  const userPrompt = `Domain: ${domainName}
Candidate Target Role: ${targetRole}
Target Starting Difficulty: ${difficulty}
Curriculum Topics Covered: ${roadmapTopics.length > 0 ? roadmapTopics.join(", ") : "Fundamentals and core architecture"}

Create the opening interview question (Question 1).
Return JSON with format:
{
  "question": "Clear, professional technical interview question",
  "topic": "Topic area name",
  "difficulty": "medium",
  "questionType": "conceptual"
}`

  try {
    return await generateJSON<FirstQuestion>({
      systemPrompt,
      userPrompt,
      schema: FirstQuestionSchema,
      temperature: 0.5,
    })
  } catch (err) {
    console.warn("AI generation failed for first question, using domain fallback:", err)
    return getFallbackFirstQuestion(domainName, difficulty)
  }
}

// 2. EVALUATE ANSWER
export async function evaluateAnswer(params: {
  domainName: string
  question: string
  answer: string
  topic?: string | null
  difficulty?: string | null
}): Promise<AnswerEvaluation> {
  const { domainName, question, answer, topic = "Technical Concept", difficulty = "medium" } = params

  const systemPrompt = `You are a Principal Technical Interviewer evaluating a candidate's spoken/text response in a ${domainName} technical interview.
Assess their response rigorously but constructively.
Evaluate:
1. Technical correctness and accuracy.
2. Depth of understanding (did they mention underlying mechanisms, algorithms, trade-offs?).
3. Clarity and structure of thought.
4. Key strengths, weaknesses, and any missing crucial concepts.
5. Actionable constructive feedback for improvement.`

  const userPrompt = `Domain: ${domainName}
Topic: ${topic}
Difficulty Level: ${difficulty}
Interview Question: "${question}"
Candidate Answer: "${answer || "(No response provided)"}"

Evaluate this answer and return JSON matching:
{
  "score": (number 0-100),
  "correctness": (number 0-100),
  "technicalDepth": (number 0-100),
  "clarity": (number 0-100),
  "knowledgeLevel": "beginner" | "intermediate" | "advanced" | "expert",
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1"],
  "missingConcepts": ["term or concept they should have mentioned"],
  "feedback": "Constructive 2-3 sentence feedback explaining what was good and how to elevate the response."
}`

  try {
    return await generateJSON<AnswerEvaluation>({
      systemPrompt,
      userPrompt,
      schema: AnswerEvaluationSchema,
      temperature: 0.3,
    })
  } catch (err) {
    console.warn("AI evaluation failed, using heuristic evaluation fallback:", err)
    return getFallbackAnswerEvaluation(answer, question)
  }
}

// 3. GENERATE ADAPTIVE NEXT QUESTION
export async function generateNextQuestion(params: {
  domainName: string
  roadmapTopics?: string[]
  previousQA: PreviousQAItem[]
  currentDifficulty?: string
  questionNumber: number
  totalTargetQuestions?: number
}): Promise<NextQuestion> {
  const {
    domainName,
    roadmapTopics = [],
    previousQA,
    currentDifficulty = "medium",
    questionNumber,
    totalTargetQuestions = 7,
  } = params

  const lastQA = previousQA[previousQA.length - 1]
  const lastScore = lastQA?.score ?? 70

  // Calculate adaptive difficulty target
  let nextDifficulty = currentDifficulty
  if (lastScore >= 80) {
    if (currentDifficulty === "easy") nextDifficulty = "medium"
    else if (currentDifficulty === "medium") nextDifficulty = "hard"
    else if (currentDifficulty === "hard") nextDifficulty = "expert"
  } else if (lastScore < 60) {
    if (currentDifficulty === "expert") nextDifficulty = "hard"
    else if (currentDifficulty === "hard") nextDifficulty = "medium"
  }

  // Select question type variation based on progress
  let preferredType = "scenario"
  if (questionNumber === 2) preferredType = "practical"
  else if (questionNumber === 3) preferredType = "scenario"
  else if (questionNumber === 4) preferredType = "debugging"
  else if (questionNumber === 5) preferredType = "system_design"
  else if (questionNumber >= 6) preferredType = "problem_solving"

  const systemPrompt = `You are a Principal AI Technical Interviewer conducting an ADAPTIVE technical interview for ${domainName}.
Your most important role is to adapt dynamically based on the candidate's previous responses:
- If they performed well, increase technical depth, present trade-off scenarios, or introduce edge-case debugging.
- If they struggled, ask a probing question or switch to a foundational application scenario without failing them immediately.
- Do NOT repeat questions or topics already asked.
- Target Question ${questionNumber} of approximately ${totalTargetQuestions}.`

  const qaHistory = previousQA
    .map(
      (qa) =>
        `Q${qa.order} (${qa.topic} [${qa.difficulty}]): "${qa.question}"\nCandidate Answer: "${qa.answer || "(None)"}"\nScore: ${qa.score}/100, Feedback: "${qa.feedback || "Evaluated"}"`
    )
    .join("\n\n")

  const userPrompt = `Domain: ${domainName}
Curriculum Topics: ${roadmapTopics.length > 0 ? roadmapTopics.join(", ") : "All core domain topics"}
Recommended Next Difficulty: ${nextDifficulty}
Preferred Question Type: ${preferredType}

Interview Transcript So Far:
${qaHistory}

Based on their answers and performance, generate Question ${questionNumber}.
Return JSON format:
{
  "question": "Adaptive question text",
  "topic": "Distinct topic name",
  "difficulty": "${nextDifficulty}",
  "questionType": "${preferredType}"
}`

  try {
    return await generateJSON<NextQuestion>({
      systemPrompt,
      userPrompt,
      schema: NextQuestionSchema,
      temperature: 0.6,
    })
  } catch (err) {
    console.warn("AI generation failed for next adaptive question, using fallback:", err)
    return getFallbackNextQuestion(domainName, questionNumber, nextDifficulty)
  }
}

// 4. GENERATE FINAL EVALUATION
export async function generateFinalEvaluation(params: {
  domainName: string
  previousQA: PreviousQAItem[]
}): Promise<FinalEvaluation> {
  const { domainName, previousQA } = params

  // Calculate base scores from answers
  const scoredItems = previousQA.filter((qa) => typeof qa.score === "number")
  const avgScore =
    scoredItems.length > 0
      ? Math.round(scoredItems.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredItems.length)
      : 70

  const systemPrompt = `You are a Senior Technical Hiring Director evaluating a candidate's complete ${domainName} mock interview performance.
Analyze their overall technical competence, problem-solving ability, conceptual understanding, practical implementation knowledge, and communication clarity.
Provide a balanced, professional, and actionable evaluation report.`

  const transcript = previousQA
    .map(
      (qa) =>
        `Q${qa.order} [${qa.topic} - ${qa.difficulty}]: ${qa.question}\nAnswer: ${qa.answer || "(No response)"}\nScore: ${qa.score}/100 | Depth: ${qa.technicalDepth || 70} | Clarity: ${qa.clarity || 70}\nFeedback: ${qa.feedback || ""}`
    )
    .join("\n\n")

  const userPrompt = `Domain: ${domainName}
Total Questions Evaluated: ${previousQA.length}
Average Item Score: ${avgScore}%

Complete Interview Transcript:
${transcript}

Compute the final multi-dimensional assessment and return JSON:
{
  "overallScore": (number 0-100),
  "technicalScore": (number 0-100),
  "problemSolvingScore": (number 0-100),
  "communicationScore": (number 0-100),
  "practicalScore": (number 0-100),
  "conceptualScore": (number 0-100),
  "readinessLevel": "Entry Level" | "Intermediate" | "Job Ready" | "Advanced / Senior Ready",
  "strengths": ["3-4 key technical strengths demonstrated"],
  "weaknesses": ["2-3 specific technical areas to improve"],
  "recommendedTopics": ["2-3 topics for further study"],
  "recommendation": "A thoughtful 3-4 sentence evaluation summary and career advice."
}`

  try {
    return await generateJSON<FinalEvaluation>({
      systemPrompt,
      userPrompt,
      schema: FinalEvaluationSchema,
      temperature: 0.3,
    })
  } catch (err) {
    console.warn("AI final evaluation failed, using calculated score fallback:", err)
    return getFallbackFinalEvaluation(domainName, previousQA, avgScore)
  }
}

// DETERMINISTIC FALLBACK GENERATORS
function getFallbackFirstQuestion(domainName: string, difficulty: string): FirstQuestion {
  const norm = domainName.toLowerCase()
  if (norm.includes("ai") || norm.includes("artificial intelligence") || norm.includes("machine learning")) {
    return {
      question:
        "Can you explain the core difference between Supervised Learning, Unsupervised Learning, and Reinforcement Learning, and give a production example of where you would apply each?",
      topic: "Machine Learning Fundamentals",
      difficulty: (difficulty as any) || "medium",
      questionType: "conceptual",
    }
  }
  if (norm.includes("data science") || norm.includes("data scientist")) {
    return {
      question:
        "How do you approach exploratory data analysis on a messy dataset with missing values and skewed distributions before training predictive models?",
      topic: "Exploratory Data Analysis",
      difficulty: (difficulty as any) || "medium",
      questionType: "practical",
    }
  }
  if (norm.includes("data analyst")) {
    return {
      question:
        "Explain how you would design a SQL query using Window Functions (e.g., ROW_NUMBER, RANK, LAG) to analyze monthly user retention cohort trends.",
      topic: "SQL Analytics & Window Functions",
      difficulty: (difficulty as any) || "medium",
      questionType: "practical",
    }
  }
  if (norm.includes("python")) {
    return {
      question:
        "Explain Python's memory management model, the Global Interpreter Lock (GIL), and when you would choose multiprocessing over multithreading for compute-heavy tasks.",
      topic: "Python Architecture & Concurrency",
      difficulty: (difficulty as any) || "medium",
      questionType: "conceptual",
    }
  }
  if (norm.includes("web")) {
    return {
      question:
        "Explain the React Reconciliation algorithm and Virtual DOM diffing. How do React keys optimize re-renders in dynamic list components?",
      topic: "React Internals & Performance",
      difficulty: (difficulty as any) || "medium",
      questionType: "conceptual",
    }
  }
  return {
    question:
      "Explain the key architectural patterns and trade-offs you consider when designing scalable, maintainable software systems.",
    topic: "System Architecture",
    difficulty: "medium",
    questionType: "conceptual",
  }
}

function getFallbackAnswerEvaluation(answer: string, _question: string): AnswerEvaluation {
  const words = (answer || "").trim().split(/\s+/).filter(Boolean).length

  if (words < 10) {
    return {
      score: 40,
      correctness: 45,
      technicalDepth: 35,
      clarity: 50,
      knowledgeLevel: "beginner",
      strengths: ["Attempted to answer the prompt"],
      weaknesses: ["Answer is very brief; lacks technical depth and trade-off analysis"],
      missingConcepts: ["Specific implementation details", "Edge cases"],
      feedback:
        "Your response was quite brief. In technical interviews, aim to explain the mechanism, provide a concrete example, and address trade-offs.",
    }
  }

  const score = Math.min(95, Math.max(65, 70 + Math.floor(Math.min(words, 100) / 4)))
  return {
    score,
    correctness: score + 2,
    technicalDepth: score - 2,
    clarity: score,
    knowledgeLevel: score >= 85 ? "advanced" : "intermediate",
    strengths: ["Good explanation of foundational concepts", "Structured thought process"],
    weaknesses: ["Could explore scalability considerations and production constraints further"],
    missingConcepts: ["System scale trade-offs"],
    feedback:
      "Strong explanation! You demonstrated solid command of the core principles. Adding real-world production nuances will make your answer even stronger.",
  }
}

function getFallbackNextQuestion(domainName: string, order: number, difficulty: string): NextQuestion {
  const norm = domainName.toLowerCase()
  
  const questionsAI: NextQuestion[] = [
    {
      question:
        "Your model achieves 98% training accuracy but only 64% validation accuracy. Walk me through the step-by-step diagnostic process and remedies you would apply.",
      topic: "Overfitting & Regularization",
      difficulty: "hard",
      questionType: "debugging",
    },
    {
      question:
        "Compare RAG (Retrieval-Augmented Generation) with Fine-Tuning. When is RAG preferred over full parameter fine-tuning for enterprise document search and knowledge grounding?",
      topic: "RAG vs Fine-Tuning",
      difficulty: "hard",
      questionType: "system_design",
    },
    {
      question:
        "Explain the Multi-Head Self-Attention mechanism in Transformer architectures. How does attention scaling prevent vanishing gradients during softmax computation?",
      topic: "Transformer Architecture",
      difficulty: "expert",
      questionType: "conceptual",
    },
    {
      question:
        "How would you design an autonomous AI Agent with function calling and tool-use capabilities using LangChain or LlamaIndex while preventing hallucinated API execution?",
      topic: "AI Agents & Guardrails",
      difficulty: "expert",
      questionType: "problem_solving",
    },
    {
      question:
        "How do you design a high-throughput, low-latency inference pipeline for serving large language models with continuous batching, KV caching, and vLLM / TensorRT?",
      topic: "MLOps & Low-Latency Serving",
      difficulty: "hard",
      questionType: "scenario",
    },
    {
      question:
        "What evaluation metrics and benchmark datasets would you establish to quantify hallucination rates and factual fidelity in production generative AI applications?",
      topic: "LLM Evaluation & Benchmarking",
      difficulty: "hard",
      questionType: "practical",
    },
    {
      question:
        "How would you implement semantic caching and vector database indexing (HNSW vs IVF) for an enterprise conversational search engine with millions of embedding vectors?",
      topic: "Vector Search & Indexing",
      difficulty: "expert",
      questionType: "system_design",
    },
  ]

  const questionsDataScience: NextQuestion[] = [
    {
      question:
        "Explain the mathematical principles of Principal Component Analysis (PCA) and how you determine the optimal number of components using explained variance ratio.",
      topic: "Dimensionality Reduction",
      difficulty: "medium",
      questionType: "conceptual",
    },
    {
      question:
        "You have a highly imbalanced dataset (99% negative, 1% positive) for fraud detection. What data resampling, algorithm adjustments, and metric selection would you employ?",
      topic: "Class Imbalance & Fraud Detection",
      difficulty: "hard",
      questionType: "scenario",
    },
    {
      question:
        "Compare Random Forests and Gradient Boosted Trees (XGBoost / LightGBM). Under what conditions would one outperform the other?",
      topic: "Ensemble Methods",
      difficulty: "hard",
      questionType: "conceptual",
    },
    {
      question:
        "How do you design and interpret an A/B test for a new recommendation engine, accounting for sample size determination, statistical power, and p-hacking risks?",
      topic: "A/B Testing & Experimentation",
      difficulty: "hard",
      questionType: "practical",
    },
    {
      question:
        "Walk me through diagnosing and correcting data leakage and concept drift in a live production forecasting model.",
      topic: "Data Leakage & Model Drift",
      difficulty: "expert",
      questionType: "debugging",
    },
  ]

  const questionsPython: NextQuestion[] = [
    {
      question:
        "Explain the difference between Python generators, iterators, and normal functions. How do generators optimize memory usage when processing multi-gigabyte data files?",
      topic: "Iterators & Memory Optimization",
      difficulty: "medium",
      questionType: "conceptual",
    },
    {
      question:
        "How do Python decorators work internally using closures and `functools.wraps`? Write or describe a decorator for caching expensive function calls with a TTL.",
      topic: "Decorators & Metaprogramming",
      difficulty: "hard",
      questionType: "practical",
    },
    {
      question:
        "Compare asyncio with threading and multiprocessing in Python. When would asyncio fail to improve performance and cause blocking event loops?",
      topic: "Asynchronous Python & Concurrency",
      difficulty: "expert",
      questionType: "scenario",
    },
    {
      question:
        "Explain Python's garbage collection mechanism involving reference counting and cyclic generational collection. How do you detect and fix memory leaks in Python services?",
      topic: "Garbage Collection & Memory Leaks",
      difficulty: "expert",
      questionType: "debugging",
    },
  ]

  const questionsWeb: NextQuestion[] = [
    {
      question:
        "Explain Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR). When should an enterprise platform choose SSR over SSG?",
      topic: "Rendering Strategies & Next.js",
      difficulty: "medium",
      questionType: "conceptual",
    },
    {
      question:
        "How do you diagnose and eliminate unnecessary re-renders in a high-frequency real-time dashboard built with React, Context, and state stores?",
      topic: "React Performance Optimization",
      difficulty: "hard",
      questionType: "debugging",
    },
    {
      question:
        "Walk through designing a secure authentication and authorization architecture using JWTs, HTTP-only refresh cookies, and RBAC middleware.",
      topic: "Web Security & Authentication",
      difficulty: "hard",
      questionType: "system_design",
    },
  ]

  let pool = questionsAI
  if (norm.includes("data") || norm.includes("analytics")) pool = questionsDataScience
  else if (norm.includes("python")) pool = questionsPython
  else if (norm.includes("web") || norm.includes("frontend") || norm.includes("fullstack")) pool = questionsWeb

  const idx = Math.min(Math.max(0, order - 2), pool.length - 1)
  const selected = pool[idx] || pool[0]

  return {
    ...selected,
    difficulty: (difficulty as any) || selected.difficulty,
  }
}

function getFallbackFinalEvaluation(
  domainName: string,
  previousQA: PreviousQAItem[],
  avgScore: number
): FinalEvaluation {
  const isPassed = avgScore >= 60
  return {
    overallScore: avgScore,
    technicalScore: Math.min(100, avgScore + 2),
    problemSolvingScore: Math.min(100, avgScore - 2),
    communicationScore: Math.min(100, avgScore + 1),
    practicalScore: Math.min(100, avgScore - 3),
    conceptualScore: Math.min(100, avgScore + 3),
    readinessLevel:
      avgScore >= 85 ? "Job Ready" : avgScore >= 60 ? "Intermediate" : "Entry Level",
    strengths: [
      `Solid understanding of core ${domainName} fundamentals`,
      "Articulate conceptual explanations",
      "Demonstrated good technical reasoning",
    ],
    weaknesses: [
      "Production deployment and scale trade-offs",
      "Edge case handling in complex architecture scenarios",
    ],
    recommendedTopics: [
      "Production Architecture & Scaling",
      "End-to-End System Performance",
    ],
    recommendation: isPassed
      ? `Congratulations! You demonstrated strong capability across the ${domainName} curriculum. Your conceptual foundation is solid and you are well-prepared for technical industry interviews.`
      : `You have made good progress in ${domainName}, but review core architecture and practical deployment topics before retaking your mock interview.`,
  }
}
