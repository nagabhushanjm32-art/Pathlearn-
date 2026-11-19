import api from "./api"

export interface InterviewQuestion {
  id: string
  order: number
  question: string
  answer?: {
    id: string
    answerText: string
    score: number | null
    whatWasGood: string | null
    whatWasMissing: string | null
    idealDirection: string | null
    improvementTip: string | null
  } | null
}

export interface Interview {
  id: string
  domainId: string
  type: string
  difficulty: string
  overallScore: number | null
  strongAreas: string[]
  weakAreas: string[]
  recommendation: string | null
  startedAt: string
  completedAt: string | null
  questions: InterviewQuestion[]
}

export async function startInterview(params: {
  domainId: string
  type: string
  difficulty: string
  numQuestions: number
}): Promise<Interview> {
  const res = await api.post("/interview/start", params)
  return res.data.interview
}

export async function fetchInterview(interviewId: string): Promise<Interview> {
  const res = await api.get(`/interview/${interviewId}`)
  return res.data.interview
}

export async function submitAnswer(questionId: string, answerText: string) {
  const res = await api.patch(`/interview/questions/${questionId}/answer`, { answerText })
  return res.data.answer
}

export async function completeInterview(interviewId: string): Promise<Interview> {
  const res = await api.post(`/interview/${interviewId}/complete`)
  return res.data.interview
}
