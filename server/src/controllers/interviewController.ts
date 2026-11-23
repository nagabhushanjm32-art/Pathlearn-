import "dotenv/config"
import { Response } from "express"
import { GoogleGenAI } from "@google/genai"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authMiddleware"

const geminiApiKey = process.env.GEMINI_API_KEY || ""
const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null
import {
  generateFirstQuestion,
  evaluateAnswer,
  generateNextQuestion as generateAdaptiveNextQuestion,
  generateFinalEvaluation,
  PreviousQAItem,
} from "../services/ai/interviewService"

// 1. CREATE INTERVIEW SESSION
export async function createInterview(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const { domainId, domainSlug, difficulty = "INTERMEDIATE", type = "TECHNICAL" } = req.body

  const lookup = domainId || domainSlug

  if (!lookup) {
    return res.status(400).json({ message: "domainId or domainSlug is required" })
  }

  try {
    const domain = await prisma.domain.findFirst({
      where: {
        OR: [{ id: lookup }, { slug: lookup }],
      },
    })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    const mockInterview = await prisma.mockInterview.create({
      data: {
        userId,
        domainId: domain.id,
        difficulty: (difficulty as any) || "INTERMEDIATE",
        type: (type as any) || "TECHNICAL",
        status: "PREPARING",
        totalQuestions: 0,
        currentQuestion: 1,
      },
      include: {
        domain: true,
        questions: {
          orderBy: { order: "asc" },
        },
      },
    })

    return res.status(201).json({ interview: mockInterview })
  } catch (error) {
    console.error("CREATE INTERVIEW ERROR:", error)
    return res.status(500).json({ message: "Something went wrong creating the interview session" })
  }
}

// 2. GET INTERVIEW STATE
export async function getInterview(req: AuthRequest, res: Response) {
  const interviewId = (req.params.id || req.params.interviewId) as string
  const userId = req.user!.userId

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        domain: true,
        questions: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: "Interview session not found or unauthorized" })
    }

    return res.status(200).json({ interview })
  } catch (error) {
    console.error("GET INTERVIEW ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching the interview" })
  }
}

// 3. START INTERVIEW SESSION (GENERATE FIRST QUESTION)
export async function startInterviewSession(req: AuthRequest, res: Response) {
  const interviewId = (req.params.id || req.params.interviewId) as string
  const userId = req.user!.userId

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: "Interview not found or unauthorized" })
    }

    // If already has questions, return the first/unanswered question
    if (interview.questions && interview.questions.length > 0) {
      const activeQ = interview.questions.find((q) => !q.answer) || interview.questions[0]
      return res.status(200).json({
        interview,
        currentQuestion: activeQ,
      })
    }

    // Generate Question 1
    const firstQ = await generateFirstQuestion({
      domainName: interview.domain.name,
      roadmapTopics: interview.domain.skillTags || [],
      targetRole: interview.domain.name,
      difficulty: interview.difficulty.toLowerCase(),
    })

    let createdQuestion = null
    try {
      createdQuestion = await prisma.interviewQuestion.create({
        data: {
          mockInterviewId: interview.id,
          order: 1,
          question: firstQ.question,
          topic: firstQ.topic,
          difficulty: firstQ.difficulty,
          questionType: firstQ.questionType,
          strengths: [],
          weaknesses: [],
          missingConcepts: [],
        },
      })
    } catch (createErr: any) {
      createdQuestion = await prisma.interviewQuestion.findFirst({
        where: { mockInterviewId: interview.id, order: 1 },
      })
      if (!createdQuestion) throw createErr
    }

    const updatedInterview = await prisma.mockInterview.update({
      where: { id: interview.id },
      data: {
        status: "IN_PROGRESS",
        totalQuestions: 1,
        currentQuestion: 1,
        startedAt: new Date(),
      },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    return res.status(200).json({
      interview: updatedInterview,
      currentQuestion: createdQuestion,
    })
  } catch (error) {
    console.error("START INTERVIEW SESSION ERROR:", error)
    // Check if question was created despite error
    const fallbackInterview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: { domain: true, questions: { orderBy: { order: "asc" } } },
    })
    if (fallbackInterview && fallbackInterview.questions.length > 0) {
      return res.status(200).json({
        interview: fallbackInterview,
        currentQuestion: fallbackInterview.questions[0],
      })
    }
    return res.status(500).json({ message: "Something went wrong starting the interview" })
  }
}

// 4. SUBMIT CANDIDATE ANSWER & EVALUATE
export async function submitAnswer(req: AuthRequest, res: Response) {
  const interviewId = (req.params.id || req.params.interviewId) as string
  const userId = req.user!.userId
  const { questionId, order, answer } = req.body

  if (!answer || typeof answer !== "string" || !answer.trim()) {
    return res.status(400).json({ message: "answer text is required" })
  }

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: "Interview not found or unauthorized" })
    }

    // Find the question to answer
    let targetQuestion = null
    if (questionId) {
      targetQuestion = interview.questions.find((q) => q.id === questionId)
    } else if (order) {
      targetQuestion = interview.questions.find((q) => q.order === Number(order))
    } else {
      // Default to first unanswered question or latest question
      targetQuestion = interview.questions.find((q) => !q.answer) || interview.questions[interview.questions.length - 1]
    }

    if (!targetQuestion) {
      return res.status(404).json({ message: "Target question not found" })
    }

    // Evaluate answer via AI
    const evaluation = await evaluateAnswer({
      domainName: interview.domain.name,
      question: targetQuestion.question,
      answer,
      topic: targetQuestion.topic,
      difficulty: targetQuestion.difficulty,
    })

    const safeScore = Math.round(Number(evaluation.score) || 70)
    const safeCorrectness = Math.round(Number(evaluation.correctness) || safeScore)
    const safeTechnicalDepth = Math.round(Number(evaluation.technicalDepth) || safeScore)
    const safeClarity = Math.round(Number(evaluation.clarity) || safeScore)

    // Update question in DB
    const updatedQuestion = await prisma.interviewQuestion.update({
      where: { id: targetQuestion.id },
      data: {
        answer,
        score: safeScore,
        correctness: safeCorrectness,
        technicalDepth: safeTechnicalDepth,
        clarity: safeClarity,
        knowledgeLevel: evaluation.knowledgeLevel || "intermediate",
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        missingConcepts: evaluation.missingConcepts || [],
        feedback: evaluation.feedback || "Evaluated.",
      },
    })

    // Also upsert InterviewAnswer relation safely
    try {
      await prisma.interviewAnswer.upsert({
        where: { interviewQuestionId: targetQuestion.id },
        update: {
          answerText: answer,
          score: safeScore,
          whatWasGood: (evaluation.strengths || []).join(". "),
          whatWasMissing: (evaluation.missingConcepts || []).join(", "),
          improvementTip: evaluation.feedback || "",
        },
        create: {
          interviewQuestionId: targetQuestion.id,
          answerText: answer,
          score: safeScore,
          whatWasGood: (evaluation.strengths || []).join(". "),
          whatWasMissing: (evaluation.missingConcepts || []).join(", "),
          improvementTip: evaluation.feedback || "",
        },
      })
    } catch (ansErr) {
      console.warn("InterviewAnswer upsert notice:", ansErr)
    }

    // Re-fetch interview with updated questions
    const currentInterview = (await prisma.mockInterview.findUnique({
      where: { id: interview.id },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })) || interview

    const answeredQuestions = currentInterview.questions.filter((q) => q.answer && q.answer.trim())
    const totalAnswered = answeredQuestions.length
    const currentOrder = targetQuestion.order

    // Check if interview target reached (7 questions)
    if (totalAnswered >= 7 || currentOrder >= 7) {
      const previousQA: PreviousQAItem[] = currentInterview.questions.map((q) => ({
        order: q.order,
        question: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
        questionType: q.questionType,
        answer: q.id === targetQuestion.id ? answer : q.answer,
        score: q.id === targetQuestion.id ? safeScore : q.score,
        feedback: q.id === targetQuestion.id ? evaluation.feedback : q.feedback,
        technicalDepth: q.id === targetQuestion.id ? safeTechnicalDepth : q.technicalDepth,
        clarity: q.id === targetQuestion.id ? safeClarity : q.clarity,
        missingConcepts: q.id === targetQuestion.id ? evaluation.missingConcepts : q.missingConcepts,
      }))

      const finalEval = await generateFinalEvaluation({
        domainName: currentInterview.domain.name,
        previousQA,
      })

      const completedInterview = await prisma.mockInterview.update({
        where: { id: interview.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          overallScore: Math.round(Number(finalEval.overallScore) || 75),
          technicalScore: Math.round(Number(finalEval.technicalScore) || 75),
          problemSolvingScore: Math.round(Number(finalEval.problemSolvingScore) || 75),
          communicationScore: Math.round(Number(finalEval.communicationScore) || 75),
          practicalScore: Math.round(Number(finalEval.practicalScore) || 75),
          conceptualScore: Math.round(Number(finalEval.conceptualScore) || 75),
          readinessLevel: finalEval.readinessLevel || "Intermediate",
          strongAreas: finalEval.strengths || [],
          weakAreas: finalEval.weaknesses || [],
          recommendedTopics: finalEval.recommendedTopics || [],
          recommendation: finalEval.recommendation || "",
        },
        include: {
          domain: true,
          questions: { orderBy: { order: "asc" } },
        },
      })

      return res.status(200).json({
        evaluation,
        question: updatedQuestion,
        isCompleted: true,
        interview: completedInterview,
        finalEvaluation: finalEval,
      })
    }

    // Otherwise, prepare next question atomically
    let nextQuestion = currentInterview.questions.find((q) => !q.answer && q.id !== targetQuestion.id)
    let nextOrder = nextQuestion?.order

    if (!nextQuestion) {
      const nextOrderCalc = currentInterview.questions.length + 1
      const previousQA: PreviousQAItem[] = currentInterview.questions.map((q) => ({
        order: q.order,
        question: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
        questionType: q.questionType,
        answer: q.id === targetQuestion.id ? answer : q.answer,
        score: q.id === targetQuestion.id ? safeScore : q.score,
        feedback: q.id === targetQuestion.id ? evaluation.feedback : q.feedback,
        technicalDepth: q.id === targetQuestion.id ? safeTechnicalDepth : q.technicalDepth,
        clarity: q.id === targetQuestion.id ? safeClarity : q.clarity,
        missingConcepts: q.id === targetQuestion.id ? evaluation.missingConcepts : q.missingConcepts,
      }))

      const nextQData = await generateAdaptiveNextQuestion({
        domainName: currentInterview.domain.name,
        roadmapTopics: currentInterview.domain.skillTags || [],
        previousQA,
        currentDifficulty: targetQuestion.difficulty || "medium",
        questionNumber: nextOrderCalc,
        totalTargetQuestions: 7,
      })

      try {
        nextQuestion = await prisma.interviewQuestion.create({
          data: {
            mockInterviewId: interview.id,
            order: nextOrderCalc,
            question: nextQData.question,
            topic: nextQData.topic,
            difficulty: nextQData.difficulty,
            questionType: nextQData.questionType,
            strengths: [],
            weaknesses: [],
            missingConcepts: [],
          },
        })
      } catch (err: any) {
        nextQuestion =
          (await prisma.interviewQuestion.findFirst({
            where: { mockInterviewId: interview.id, order: nextOrderCalc },
          })) || undefined
      }

      nextOrder = nextOrderCalc

      await prisma.mockInterview.update({
        where: { id: interview.id },
        data: {
          totalQuestions: nextOrderCalc,
          currentQuestion: nextOrderCalc,
        },
      })
    }

    const refreshedInterview = await prisma.mockInterview.findUnique({
      where: { id: interview.id },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    return res.status(200).json({
      evaluation,
      question: updatedQuestion,
      isCompleted: false,
      nextQuestion,
      nextOrder: nextOrder || (nextQuestion ? nextQuestion.order : currentOrder + 1),
      interview: refreshedInterview || currentInterview,
    })
  } catch (error) {
    console.error("SUBMIT ANSWER ERROR:", error)
    return res.status(500).json({ message: "Something went wrong submitting and evaluating the answer" })
  }
}

// 5. GENERATE NEXT ADAPTIVE QUESTION
export async function generateNextAdaptiveQuestion(req: AuthRequest, res: Response) {
  const interviewId = (req.params.id || req.params.interviewId) as string
  const userId = req.user!.userId

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: "Interview not found or unauthorized" })
    }

    // 1. If an unanswered question ALREADY exists, return it!
    const unanswered = interview.questions.find((q) => !q.answer)
    if (unanswered) {
      return res.status(200).json({
        question: unanswered,
        questionNumber: unanswered.order,
      })
    }

    // 2. Count total answered questions
    const answeredCount = interview.questions.filter((q) => q.answer).length
    if (answeredCount >= 7) {
      return res.status(200).json({
        maxReached: true,
        isCompleted: true,
        message: "All 7 interview questions completed. Please proceed to interview results.",
      })
    }

    const nextOrder = interview.questions.length + 1

    const previousQA: PreviousQAItem[] = interview.questions.map((q) => ({
      order: q.order,
      question: q.question,
      topic: q.topic,
      difficulty: q.difficulty,
      questionType: q.questionType,
      answer: q.answer,
      score: q.score,
      feedback: q.feedback,
      technicalDepth: q.technicalDepth,
      clarity: q.clarity,
      missingConcepts: q.missingConcepts,
    }))

    const nextQ = await generateAdaptiveNextQuestion({
      domainName: interview.domain.name,
      roadmapTopics: interview.domain.skillTags || [],
      previousQA,
      currentDifficulty: interview.questions[interview.questions.length - 1]?.difficulty || "medium",
      questionNumber: nextOrder,
      totalTargetQuestions: 7,
    })

    let createdQuestion = null
    try {
      createdQuestion = await prisma.interviewQuestion.create({
        data: {
          mockInterviewId: interview.id,
          order: nextOrder,
          question: nextQ.question,
          topic: nextQ.topic,
          difficulty: nextQ.difficulty,
          questionType: nextQ.questionType,
          strengths: [],
          weaknesses: [],
          missingConcepts: [],
        },
      })
    } catch (createErr: any) {
      createdQuestion = await prisma.interviewQuestion.findFirst({
        where: { mockInterviewId: interview.id, order: nextOrder },
      })
      if (!createdQuestion) throw createErr
    }

    await prisma.mockInterview.update({
      where: { id: interview.id },
      data: {
        totalQuestions: nextOrder,
        currentQuestion: nextOrder,
      },
    })

    return res.status(200).json({
      question: createdQuestion,
      questionNumber: nextOrder,
    })
  } catch (error) {
    console.error("GENERATE NEXT QUESTION ERROR:", error)
    return res.status(500).json({ message: "Something went wrong generating the next adaptive question" })
  }
}

// 6. COMPLETE INTERVIEW SESSION & FINAL EVALUATION
export async function completeInterview(req: AuthRequest, res: Response) {
  const interviewId = (req.params.id || req.params.interviewId) as string
  const userId = req.user!.userId

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: "Interview not found or unauthorized" })
    }

    const previousQA: PreviousQAItem[] = interview.questions.map((q) => ({
      order: q.order,
      question: q.question,
      topic: q.topic,
      difficulty: q.difficulty,
      questionType: q.questionType,
      answer: q.answer,
      score: q.score,
      feedback: q.feedback,
      technicalDepth: q.technicalDepth,
      clarity: q.clarity,
      missingConcepts: q.missingConcepts,
    }))

    const evaluation = await generateFinalEvaluation({
      domainName: interview.domain.name,
      previousQA,
    })

    const updatedInterview = await prisma.mockInterview.update({
      where: { id: interview.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        overallScore: Math.round(Number(evaluation.overallScore) || 75),
        technicalScore: Math.round(Number(evaluation.technicalScore) || 75),
        problemSolvingScore: Math.round(Number(evaluation.problemSolvingScore) || 75),
        communicationScore: Math.round(Number(evaluation.communicationScore) || 75),
        practicalScore: Math.round(Number(evaluation.practicalScore) || 75),
        conceptualScore: Math.round(Number(evaluation.conceptualScore) || 75),
        readinessLevel: evaluation.readinessLevel || "Intermediate",
        strongAreas: evaluation.strengths || [],
        weakAreas: evaluation.weaknesses || [],
        recommendedTopics: evaluation.recommendedTopics || [],
        recommendation: evaluation.recommendation || "",
      },
      include: {
        domain: true,
        questions: { orderBy: { order: "asc" } },
      },
    })

    return res.status(200).json({
      interview: updatedInterview,
      evaluation,
    })
  } catch (error) {
    console.error("COMPLETE INTERVIEW ERROR:", error)
    return res.status(500).json({ message: "Something went wrong evaluating the complete interview" })
  }
}

// 7. GET USER'S COMPLETED INTERVIEW HISTORY
export async function getInterviewHistory(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const interviews = await prisma.mockInterview.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      include: {
        domain: true,
        questions: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    })

    return res.status(200).json({ interviews })
  } catch (error) {
    console.error("GET INTERVIEW HISTORY ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching interview history" })
  }
}

// 8. GET SPECIFIC INTERVIEW RESULT
export async function getInterviewResult(req: AuthRequest, res: Response) {
  const interviewId = (req.params.id || req.params.interviewId) as string
  const userId = req.user!.userId

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        domain: true,
        questions: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: "Interview result not found or unauthorized" })
    }

    return res.status(200).json({
      interview,
      isPassed: (interview.overallScore || 0) >= 60,
    })
  } catch (error) {
    console.error("GET INTERVIEW RESULT ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching interview result" })
  }
}

// 9. TRANSCRIBE RECORDED AUDIO USING GEMINI
export async function transcribeAudio(req: AuthRequest, res: Response) {
  const { audioBase64, mimeType = "audio/webm", questionTopic, questionText } = req.body

  if (!audioBase64 || typeof audioBase64 !== "string") {
    return res.status(400).json({ message: "audioBase64 is required" })
  }

  try {
    if (genAI && geminiApiKey) {
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "")
      const cleanMime = mimeType.split(";")[0] || "audio/webm"

      const candidateAudioModels = [
        "gemini-flash-lite-latest",
        "gemini-3.5-flash",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash",
      ]

      for (const modelName of candidateAudioModels) {
        try {
          const response = await genAI.models.generateContent({
            model: modelName,
            contents: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              },
              `Transcribe the candidate's speech from this technical interview audio into professional English. Faithfully capture technical terms, algorithms, and architecture concepts. Return only the spoken transcription text without any commentary or quotation marks. If completely inaudible or pure background silence, return EMPTY.${
                questionTopic ? ` Interview Question Context: ${questionTopic}.` : ""
              }`,
            ],
          })

          const text = response.text?.trim() || ""
          if (
            text &&
            text !== "EMPTY" &&
            !text.toLowerCase().includes("no speech") &&
            !text.toLowerCase().includes("could not transcribe")
          ) {
            return res.status(200).json({ transcript: text })
          }
        } catch (mErr: any) {
          console.warn(`Transcribe model ${modelName} notice:`, mErr?.status || mErr?.message || mErr)
          if (
            mErr?.status === 400 ||
            mErr?.status === 401 ||
            mErr?.status === 403 ||
            (mErr?.message && (mErr.message.includes("API_KEY") || mErr.message.includes("unauthorized") || mErr.message.includes("forbidden")))
          ) {
            break
          }
        }
      }
    }

    return res.status(200).json({ transcript: "" })
  } catch (error) {
    console.error("TRANSCRIBE AUDIO ERROR:", error)
    return res.status(200).json({ transcript: "" })
  }
}

