import api from "./api"
import {
  MockInterviewSession,
  InterviewQuestionItem,
  AnswerEvaluationData,
  FinalEvaluationData,
  MockInterviewResult,
  InterviewHistoryItem,
} from "../types"

export const interviewService = {
  /**
   * POST /api/interviews - Create new interview session
   */
  async createInterview(params: {
    domainId?: string
    domainSlug?: string
    difficulty?: string
    type?: string
  }): Promise<{ interview: MockInterviewSession }> {
    const res = await api.post("/interviews", params)
    return res.data
  },

  /**
   * GET /api/interviews/:id - Fetch current interview session state
   */
  async getInterview(interviewId: string): Promise<{ interview: MockInterviewSession }> {
    const res = await api.get(`/interviews/${interviewId}`)
    return res.data
  },

  /**
   * POST /api/interviews/:id/start - Generate Question 1 & start session
   */
  async startInterviewSession(
    interviewId: string
  ): Promise<{ interview: MockInterviewSession; currentQuestion: InterviewQuestionItem }> {
    const res = await api.post(`/interviews/${interviewId}/start`)
    return res.data
  },

  /**
   * POST /api/interviews/:id/answer - Submit candidate answer for evaluation
   */
  async submitAnswer(
    interviewId: string,
    params: { questionId?: string; order?: number; answer: string }
  ): Promise<{
    evaluation: AnswerEvaluationData
    question: InterviewQuestionItem
    nextQuestion?: InterviewQuestionItem
    nextOrder?: number
    isCompleted?: boolean
    interview?: MockInterviewSession
  }> {
    const res = await api.post(`/interviews/${interviewId}/answer`, params)
    return res.data
  },

  /**
   * POST /api/interviews/:id/transcribe-audio - Transcribe recorded microphone audio via Gemini
   */
  async transcribeAudio(
    interviewId: string,
    audioBase64: string,
    mimeType = "audio/webm",
    questionTopic?: string,
    questionText?: string
  ): Promise<{ transcript: string }> {
    const res = await api.post(`/interviews/${interviewId}/transcribe-audio`, {
      audioBase64,
      mimeType,
      questionTopic,
      questionText,
    })
    return res.data
  },

  /**
   * POST /api/interviews/:id/next-question - Generate next adaptive question
   */
  async generateNextQuestion(
    interviewId: string
  ): Promise<{ question: InterviewQuestionItem; questionNumber: number }> {
    const res = await api.post(`/interviews/${interviewId}/next-question`)
    return res.data
  },

  /**
   * POST /api/interviews/:id/complete - Complete interview & calculate final evaluation
   */
  async completeInterview(
    interviewId: string
  ): Promise<{ interview: MockInterviewSession; evaluation: FinalEvaluationData }> {
    const res = await api.post(`/interviews/${interviewId}/complete`)
    return res.data
  },

  /**
   * GET /api/interviews/history - Get list of completed interviews
   */
  async getInterviewHistory(): Promise<{ interviews: MockInterviewSession[] }> {
    const res = await api.get("/interviews/history")
    return res.data
  },

  /**
   * GET /api/interviews/:id/result - Get specific completed interview result
   */
  async getInterviewResult(interviewId: string): Promise<{
    interview: MockInterviewSession
    isPassed: boolean
  }> {
    const res = await api.get(`/interviews/${interviewId}/result`)
    return res.data
  },

  /**
   * Domain-based result query
   */
  async getInterviewResults(domainSlug: string): Promise<MockInterviewResult | undefined> {
    try {
      const res = await api.get(`/interview/${domainSlug}/results`)
      return res.data?.results || res.data
    } catch {
      return undefined
    }
  },
}

export default interviewService
