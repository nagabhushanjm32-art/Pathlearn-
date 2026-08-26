import "dotenv/config"
import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authenticate"
import { generateQuiz } from "../services/ai/quizGenerator"

export async function generateQuizForStep(req: AuthRequest, res: Response) {
  const { stepId } = req.params

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: { roadmap: true, quiz: true },
    })

    if (!step) {
      return res.status(404).json({ message: "Step not found" })
    }

    if (step.roadmap.userId !== req.user!.userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    if (step.quiz) {
      const existingQuiz = await prisma.quiz.findUnique({
        where: { id: step.quiz.id },
        include: { questions: true },
      })
      return res.status(200).json({ quiz: existingQuiz })
    }

    const questions = await generateQuiz({
      stepTitle: step.title,
      stepDescription: step.description,
      learningObjectives: step.learningObjectives,
      difficulty: step.difficulty,
    })

    const quiz = await prisma.quiz.create({
      data: {
        roadmapStepId: stepId,
        questions: {
          create: questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            difficulty: q.difficulty,
          })),
        },
      },
      include: { questions: true },
    })

    return res.status(201).json({ quiz })
  } catch (error) {
    console.error("GENERATE QUIZ ERROR:", error)
    return res.status(500).json({ message: "Something went wrong generating the quiz" })
  }
}

export async function submitQuizAttempt(req: AuthRequest, res: Response) {
  const { quizId } = req.params
  const { answers } = req.body

  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "answers must be an array" })
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    let score = 0
    const answerRecords = quiz.questions.map((question) => {
      const submitted = answers.find((a: any) => a.questionId === question.id)
      const selectedIndex = submitted?.selectedIndex ?? -1
      const isCorrect = selectedIndex === question.correctIndex
      if (isCorrect) score++
      return {
        quizQuestionId: question.id,
        selectedIndex,
        isCorrect,
      }
    })

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: req.user!.userId,
        score,
        totalCount: quiz.questions.length,
        answers: { create: answerRecords },
      },
      include: {
        answers: { include: { quizQuestion: true } },
      },
    })

    return res.status(201).json({ attempt })
  } catch (error) {
    console.error("SUBMIT QUIZ ERROR:", error)
    return res.status(500).json({ message: "Something went wrong submitting the quiz" })
  }
}
