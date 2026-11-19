import api from "./api"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  suggestedFollowUps?: string[]
}

export const chatService = {
  async sendMessage(
    message: string,
    history: { role: "user" | "assistant"; content: string }[] = [],
    useResumeContext: boolean = true
  ): Promise<{
    reply: string
    suggestedFollowUps: string[]
    resumeContextActive: boolean
    userContextSummary?: string
  }> {
    const res = await api.post("/chat/message", {
      message,
      history,
      useResumeContext,
    })
    return res.data
  },
}

export default chatService
