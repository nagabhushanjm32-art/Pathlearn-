import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authenticate"
import { startInterviewSchema } from "../validators/interviewValidator"
import { generateInterviewQuestions } from "../services/ai/interviewGenerator"
import { evaluateInterview } from "../services/ai/interviewEvaluator"

export async function startInterview(req: AuthRequest, res: Response) {
  const parsed = startInterviewSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const { domainId, type, difficulty, numQuestions } = parsed.data

  try {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    const questions = await generateInterviewQuestions({
      domainName: domain.name,
      type,
      difficulty,
      numQuestions,
    })

    const mockInterview = await prisma.mockInterview.create({
      data: {
        userId: req.user!.userId,
        domainId,
        type,
        difficulty,
        questions: {
          create: questions.map((q, i) => ({ order: i + 1, question: q })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    return res.status(201).json({ interview: mockInterview })
  } catch (error) {
    console.error("START INTERVIEW ERROR:", error)
    return res.status(500).json({ message: "Something went wrong starting the interview" })
  }
}

export async function getInterview(req: AuthRequest, res: Response) {
  const { interviewId } = req.params

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answer: true },
        },
      },
    })

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ message: "Interview not found" })
    }

    return res.status(200).json({ interview })
  } catch (error) {
    console.error("GET INTERVIEW ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching the interview" })
  }
}

export async function submitAnswer(req: AuthRequest, res: Response) {
  const { questionId } = req.params
  const { answerText } = req.body

  if (!answerText || typeof answerText !== "string") {
    return res.status(400).json({ message: "answerText is required" })
  }

  try {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: { mockInterview: true },
    })

    if (!question || question.mockInterview.userId !== req.user!.userId) {
      return res.status(404).json({ message: "Question not found" })
    }

    const answer = await prisma.interviewAnswer.upsert({
      where: { interviewQuestionId: questionId },
      update: { answerText },
      create: { interviewQuestionId: questionId, answerText },
    })

    return res.status(200).json({ answer })
  } catch (error) {
    console.error("SUBMIT ANSWER ERROR:", error)
    return res.status(500).json({ message: "Something went wrong saving your answer" })
  }
}

export async function completeInterview(req: AuthRequest, res: Response) {
  const { interviewId } = req.params

  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answer: true },
        },
        domain: true,
      },
    })

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ message: "Interview not found" })
    }

    const qaPairs = interview.questions.map((q) => ({
      question: q.question,
      answer: q.answer?.answerText || "",
    }))

    const evaluation = await evaluateInterview({
      domainName: interview.domain.name,
      type: interview.type,
      qaPairs,
    })

    await Promise.all(
      evaluation.answerEvaluations.map((evalItem) => {
        const question = interview.questions[evalItem.questionIndex]
        if (!question) return Promise.resolve()
        return prisma.interviewAnswer.update({
          where: { interviewQuestionId: question.id },
          data: {
            score: evalItem.score,
            whatWasGood: evalItem.whatWasGood,
            whatWasMissing: evalItem.whatWasMissing,
            idealDirection: evalItem.idealDirection,
            improvementTip: evalItem.improvementTip,
          },
        })
      })
    )

    const updatedInterview = await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        overallScore: evaluation.overallScore,
        strongAreas: evaluation.strongAreas,
        weakAreas: evaluation.weakAreas,
        recommendation: evaluation.recommendation,
        completedAt: new Date(),
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answer: true },
        },
      },
    })

    return res.status(200).json({ interview: updatedInterview })
  } catch (error) {
    console.error("COMPLETE INTERVIEW ERROR:", error)
    return res.status(500).json({ message: "Something went wrong evaluating the interview" })
  }
}

export async function getInterviewHistory(req: AuthRequest, res: Response) {
  try {
    const interviews = await prisma.mockInterview.findMany({
      where: { userId: req.user!.userId, completedAt: { not: null } },
      include: { domain: true },
      orderBy: { startedAt: "desc" },
    })

    return res.status(200).json({ interviews })
  } catch (error) {
    console.error("GET INTERVIEW HISTORY ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching interview history" })
  }
}
