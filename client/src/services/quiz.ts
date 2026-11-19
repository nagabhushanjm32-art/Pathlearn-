import api from "./api"
import { StepQuiz, QuizAttemptResult } from "../types"

export async function fetchOrGenerateQuiz(stepId: string): Promise<StepQuiz> {
  const res = await api.get(`/quiz/steps/${stepId}`)
  return res.data.quiz
}

export async function submitQuizAttempt(
  quizId: string,
  answers: { questionId: string; selectedIndex: number }[]
): Promise<{ attempt: QuizAttemptResult; stepProgress: any }> {
  const res = await api.post(`/quiz/${quizId}/submit`, { answers })
  return res.data
}
