import api from "./api"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty: string
}

export interface Quiz {
  id: string
  roadmapStepId: string
  questions: QuizQuestion[]
}

export interface QuizAnswerResult {
  quizQuestionId: string
  selectedIndex: number
  isCorrect: boolean
  quizQuestion: QuizQuestion
}

export interface QuizAttempt {
  id: string
  score: number
  totalCount: number
  answers: QuizAnswerResult[]
}

export async function generateQuizForStep(stepId: string): Promise<Quiz> {
  const res = await api.post(`/quiz/steps/${stepId}/generate`)
  return res.data.quiz
}

export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; selectedIndex: number }[]
): Promise<QuizAttempt> {
  const res = await api.post(`/quiz/${quizId}/submit`, { answers })
  return res.data.attempt
}
