import prisma from "../../utils/prisma"
import { generateText } from "./aiService"

export interface ChatMessage {
  id?: string
  role: "user" | "assistant"
  content: string
  timestamp?: string
  suggestedFollowUps?: string[]
}

function generateContextualFollowUps(query: string, _reply: string): string[] {
  const lower = query.toLowerCase()
  if (
    (lower.includes("ask") && lower.includes("question")) ||
    lower.includes("quiz") ||
    lower.includes("interview") ||
    lower.includes("test me")
  ) {
    return [
      "Ask me a harder technical question",
      "Give me a real-world system design scenario",
      "Explain the ideal answer to Question 1",
    ]
  }
  if (
    lower.includes("code") ||
    lower.includes("algorithm") ||
    lower.includes("dsa") ||
    lower.includes("cache") ||
    lower.includes("tree") ||
    lower.includes("function") ||
    lower.includes("implement")
  ) {
    return [
      "What is the time and space complexity?",
      "Can we optimize this solution further?",
      "How would you test edge cases for this?",
    ]
  }
  if (
    lower.includes("system design") ||
    lower.includes("architecture") ||
    lower.includes("scale") ||
    lower.includes("database")
  ) {
    return [
      "How do we handle high concurrency and bottlenecks?",
      "What database indexing or sharding strategy fits best?",
      "Compare this with alternative architecture patterns",
    ]
  }
  if (
    lower.includes("resume") ||
    lower.includes("bullet") ||
    lower.includes("portfolio") ||
    lower.includes("career")
  ) {
    return [
      "How can I tailor this for senior engineering roles?",
      "What metrics can I add to highlight business impact?",
      "What interview questions will recruiters ask about this?",
    ]
  }
  return [
    "Tell me more with a real-world example",
    "What are common pitfalls or best practices?",
    "Ask me a follow-up question on this",
  ]
}

export const aiChatService = {
  /**
   * Generates an intelligent, conversational chat response like ChatGPT & Claude,
   * answering ANY question the user asks while optionally referencing user/resume context when helpful.
   */
  async processChatMessage(
    userId: string,
    message: string,
    history: { role: "user" | "assistant"; content: string }[] = [],
    useResumeContext: boolean = true
  ): Promise<{
    reply: string
    suggestedFollowUps: string[]
    resumeContextActive: boolean
    userContextSummary?: string
  }> {
    // 1. Fetch user data and resume context if available
    let userName = "Learner"
    let targetRole = "Software Engineer"
    let skillList = ""
    let gapList = ""
    let resumeSnippet = ""
    let hasResume = false

    if (userId) {
      try {
        const [user, profile, careerProfile, resumeAnalysis, skills, gaps] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
          }),
          prisma.profile.findUnique({
            where: { userId },
          }),
          prisma.careerProfile.findUnique({
            where: { userId },
          }),
          prisma.resumeAnalysis.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          }),
          prisma.userSkill.findMany({
            where: { userId },
            take: 20,
          }),
          prisma.skillGap.findMany({
            where: { userId },
            take: 5,
          }),
        ])

        userName = user?.name || "Learner"
        targetRole = careerProfile?.targetRole || profile?.targetRole || "Software Engineer"
        skillList = skills.map((s) => s.name).join(", ")
        gapList = gaps.map((g) => g.skillName).join(", ")

        if (resumeAnalysis?.parsedData) {
          hasResume = true
          const parsed = resumeAnalysis.parsedData as any
          if (parsed.summary) resumeSnippet = parsed.summary
          if (Array.isArray(parsed.skills) && !skillList) {
            skillList = parsed.skills.join(", ")
          }
        }
      } catch (e) {
        console.warn("Could not load user context for chat:", e)
      }
    }

    // 2. Build flexible, versatile system prompt like ChatGPT & Claude
    const systemPrompt = `You are PathLearn AI, an exceptionally smart, helpful, and versatile AI assistant comparable to ChatGPT and Claude 3.5 Sonnet.

Key Instructions:
1. ANSWER ANY QUESTION: You can answer ANY question the user asks — coding, software engineering, algorithms, system design, debugging, math, science, history, writing, philosophy, career advice, or general knowledge. Never refuse or restrict inquiries.
2. ASKING QUESTIONS / QUIZZING: If the user says "ask any questions", "ask me questions", "quiz me", "interview me", or asks for practice questions:
   - Immediately provide 3-5 clear, engaging, and thought-provoking questions (technical, conceptual, or situational) tailored to their interests or target field.
   - Encourage them to try answering one or all of them.
3. CHATGPT & CLAUDE QUALITY:
   - Provide articulate, thorough, structured, and insightful answers.
   - When explaining code, use clean, well-commented code blocks with syntax highlighting (Python, TypeScript, JavaScript, C++, Java, Go, Rust, SQL, etc.).
   - Break down complex concepts into intuitive analogies, key points, and clear steps.
   - Format cleanly with GitHub Markdown (headers, bullet points, bold key terms, tables, code blocks).
4. BE DIRECT & NATURAL:
   - Answer directly and conversationally without unnecessary boilerplate greetings.
   - Do NOT force resume reviews or career talk unless the user specifically asks about their resume, portfolio, or career.

${
  useResumeContext && hasResume
    ? `=== OPTIONAL USER CONTEXT (Reference only when relevant to the user's specific request):
- User Name: ${userName}
- Target Role: ${targetRole}
${skillList ? `- Known Skills: ${skillList}` : ""}
${gapList ? `- Focus Areas: ${gapList}` : ""}
${resumeSnippet ? `- Resume Background: ${resumeSnippet.slice(0, 400)}` : ""}
=== END CONTEXT ===`
    : ""
}`

    // 3. Format message history for AI
    const formattedHistory = history.slice(-8).map((h) => ({
      role: (h.role === "assistant" ? "model" : "user") as "user" | "model" | "assistant",
      content: h.content,
    }))

    // 4. Generate AI reply
    let reply = ""
    try {
      reply = await generateText({
        systemPrompt,
        userPrompt: message,
        history: formattedHistory,
        temperature: 0.7,
      })
    } catch (err: any) {
      console.warn("AI Chat generateText failed:", err)
      reply = `I'm here to help! Could you please repeat or rephrase your question? If you'd like me to ask you questions or quiz you on any topic, just let me know what subject you prefer!`
    }

    // 5. Generate contextual follow-ups instantly
    const suggestedFollowUps = generateContextualFollowUps(message, reply)

    return {
      reply,
      suggestedFollowUps,
      resumeContextActive: useResumeContext && hasResume,
      userContextSummary: `${userName} • ${targetRole}`,
    }
  },
}

export default aiChatService
