import { Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authMiddleware"
import { generateQuiz } from "../services/ai/quizGenerator"

const PASSING_PERCENTAGE = 60

/**
 * GET /api/quiz/steps/:stepId or POST /api/quiz/steps/:stepId/generate
 * Fetches or generates the step quiz with questions and previous attempts
 */
export async function getOrGenerateQuizForStep(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const stepId = req.params.stepId as string

  try {
    const step = await prisma.roadmapStep.findUnique({
      where: { id: stepId },
      include: {
        roadmap: true,
        quiz: {
          include: {
            questions: {
              orderBy: { createdAt: "asc" },
            },
            attempts: {
              where: { userId },
              orderBy: { score: "desc" },
              take: 1,
              include: {
                answers: true,
              },
            },
          },
        },
      },
    })

    if (!step) {
      return res.status(404).json({ message: "Roadmap step not found" })
    }

    let quiz = step.quiz

    // If quiz does not exist, generate and persist it
    if (!quiz || quiz.questions.length === 0) {
      const generatedQuestions = await generateQuiz({
        stepTitle: step.title,
        stepDescription: step.description,
        learningObjectives: step.learningObjectives,
        difficulty: step.difficulty,
      })

      if (!quiz) {
        quiz = await prisma.quiz.create({
          data: {
            roadmapStepId: stepId,
            questions: {
              create: generatedQuestions.map((q) => ({
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
                difficulty: q.difficulty,
              })),
            },
          },
          include: {
            questions: { orderBy: { createdAt: "asc" } },
            attempts: {
              where: { userId },
              take: 1,
              include: { answers: true },
            },
          },
        })
      } else {
        // Create questions for existing quiz record
        for (const q of generatedQuestions) {
          await prisma.quizQuestion.create({
            data: {
              quizId: quiz.id,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              difficulty: q.difficulty,
            },
          })
        }
        quiz = await prisma.quiz.findUnique({
          where: { id: quiz.id },
          include: {
            questions: { orderBy: { createdAt: "asc" } },
            attempts: {
              where: { userId },
              take: 1,
              include: { answers: true },
            },
          },
        })
      }
    }

    // Format response
    const bestAttempt = quiz?.attempts?.[0]
    const totalQuestions = quiz?.questions?.length || 0
    const bestScorePct =
      bestAttempt && totalQuestions > 0
        ? Math.round((bestAttempt.score / totalQuestions) * 100)
        : null

    const formattedQuiz = {
      id: quiz!.id,
      roadmapStepId: stepId,
      stepTitle: step.title,
      stepOrder: step.order,
      passingScore: PASSING_PERCENTAGE,
      totalQuestions,
      isPassed: bestScorePct !== null && bestScorePct >= PASSING_PERCENTAGE,
      bestScore: bestScorePct,
      questions: quiz!.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    }

    return res.status(200).json({ quiz: formattedQuiz })
  } catch (error) {
    console.error("GET OR GENERATE QUIZ ERROR:", error)
    return res.status(500).json({ message: "Failed to load quiz" })
  }
}

/**
 * POST /api/quiz/:quizId/submit or POST /api/quizzes/:quizId/attempt
 * Evaluates quiz attempt, persists answers, updates step progress
 */
export async function submitQuizAttempt(req: AuthRequest, res: Response) {
  const userId = req.user?.userId
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const quizId = req.params.quizId as string
  const { answers } = req.body

  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "answers must be an array of { questionId, selectedIndex }" })
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        roadmapStep: {
          include: { roadmap: true },
        },
      },
    })

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    let correctCount = 0
    const totalQuestions = quiz.questions.length

    const answerRecords = quiz.questions.map((question) => {
      const submitted = answers.find((a: any) => a.questionId === question.id)
      const selectedIndex = typeof submitted?.selectedIndex === "number" ? submitted.selectedIndex : -1
      const isCorrect = selectedIndex === question.correctIndex
      if (isCorrect) correctCount++

      return {
        quizQuestionId: question.id,
        selectedIndex,
        isCorrect,
      }
    })

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
    const isPassed = scorePercentage >= PASSING_PERCENTAGE

    // Save attempt in database
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score: correctCount,
        totalCount: totalQuestions,
        answers: {
          create: answerRecords,
        },
      },
      include: {
        answers: {
          include: { quizQuestion: true },
        },
      },
    })

    // Update UserStepProgress
    const stepId = quiz.roadmapStepId
    let stepProgress = await prisma.userStepProgress.findUnique({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
    })

    const wasQuizCompleted = stepProgress?.quizCompleted || false
    const nowQuizCompleted = wasQuizCompleted || isPassed
    const videoCompleted = stepProgress?.videoCompleted || false

    const shouldCompleteStep = isPassed && videoCompleted

    if (!stepProgress) {
      stepProgress = await prisma.userStepProgress.create({
        data: {
          userId,
          stepId,
          videoProgress: 0,
          videoStarted: false,
          videoCompleted: false,
          quizCompleted: isPassed,
          quizScore: scorePercentage,
          stepCompleted: shouldCompleteStep,
          completedAt: shouldCompleteStep ? new Date() : null,
        },
      })
    } else {
      stepProgress = await prisma.userStepProgress.update({
        where: { id: stepProgress.id },
        data: {
          quizCompleted: nowQuizCompleted,
          quizScore: Math.max(stepProgress.quizScore || 0, scorePercentage),
          stepCompleted: stepProgress.stepCompleted || shouldCompleteStep,
          completedAt:
            !stepProgress.stepCompleted && shouldCompleteStep
              ? new Date()
              : stepProgress.completedAt,
        },
      })
    }

    // If step became completed, unlock next step and recalculate roadmap percentage
    if (stepProgress.stepCompleted && quiz.roadmapStep) {
      await unlockNextStepAndRecalculate(
        userId,
        quiz.roadmapStep.roadmapId,
        quiz.roadmapStep.order,
        quiz.roadmapStep.id
      )
    }

    return res.status(200).json({
      message: isPassed ? "Congratulations! You passed the quiz." : "Quiz submitted. Keep reviewing!",
      attempt: {
        id: attempt.id,
        score: correctCount,
        totalCount: totalQuestions,
        percentage: scorePercentage,
        isPassed,
        passingScore: PASSING_PERCENTAGE,
        answers: attempt.answers.map((a) => ({
          questionId: a.quizQuestionId,
          selectedIndex: a.selectedIndex,
          correctIndex: a.quizQuestion.correctIndex,
          isCorrect: a.isCorrect,
          explanation: a.quizQuestion.explanation,
        })),
      },
      stepProgress,
    })
  } catch (error) {
    console.error("SUBMIT QUIZ ATTEMPT ERROR:", error)
    return res.status(500).json({ message: "Failed to process quiz submission" })
  }
}

/**
 * Helper to unlock the next step in sequence and update roadmap progress
 */
async function unlockNextStepAndRecalculate(
  userId: string,
  roadmapId: string,
  currentOrder: number,
  currentStepId: string
) {
  await prisma.roadmapStep.update({
    where: { id: currentStepId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  })

  const nextStep = await prisma.roadmapStep.findFirst({
    where: {
      roadmapId,
      order: currentOrder + 1,
    },
  })

  if (nextStep) {
    await prisma.roadmapStep.update({
      where: { id: nextStep.id },
      data: { isLocked: false },
    })
  }

  const allSteps = await prisma.roadmapStep.findMany({
    where: { roadmapId },
  })

  const userProgresses = await prisma.userStepProgress.findMany({
    where: {
      userId,
      stepId: { in: allSteps.map((s) => s.id) },
      stepCompleted: true,
    },
  })

  const progressPct =
    allSteps.length > 0 ? Math.round((userProgresses.length / allSteps.length) * 100) : 0

  const updatedRoadmap = await prisma.roadmap.update({
    where: { id: roadmapId },
    data: { progress: progressPct },
  })

  await prisma.userProgress.upsert({
    where: {
      userId_domainId: {
        userId,
        domainId: updatedRoadmap.domainId,
      },
    },
    update: { percentage: progressPct },
    create: {
      userId,
      domainId: updatedRoadmap.domainId,
      percentage: progressPct,
    },
  })
}
