import React, { useState, useRef, useEffect } from "react"
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Code2,
  Cpu,
  Brain,
  MessageSquare
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "../context/AuthContext"
import { chatService, ChatMessage } from "../services/chatService"
import { formatDisplayName } from "../lib/greeting"

/**
 * Formats markdown-like text with headers, code blocks, bold text, and bullet lists
 */
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null)

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeIdx(idx)
    setTimeout(() => setCopiedCodeIdx(null), 2000)
  }

  // Split code blocks from standard markdown text
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extract language and code
          const firstLineBreak = part.indexOf("\n")
          const lang =
            firstLineBreak > 3 ? part.slice(3, firstLineBreak).trim() : "code"
          const code =
            firstLineBreak !== -1
              ? part.slice(firstLineBreak + 1, -3).trim()
              : part.slice(3, -3).trim()

          return (
            <div
              key={pIdx}
              className="my-3 rounded-xl overflow-hidden border border-border/80 bg-slate-950 text-slate-100 font-mono text-[11px] sm:text-xs shadow-sm"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
                <span className="font-semibold uppercase tracking-wider">{lang || "code"}</span>
                <button
                  onClick={() => handleCopyCode(code, pIdx)}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedCodeIdx === pIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto whitespace-pre leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Standard text lines
        const lines = part.split("\n")
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim()
              if (!trimmed) {
                return <div key={lIdx} className="h-1.5" />
              }

              // Heading 1 / 2 / 3
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="font-bold text-foreground text-xs sm:text-sm pt-2">
                    {trimmed.replace(/^###\s+/, "")}
                  </h4>
                )
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="font-bold text-foreground text-sm sm:text-base pt-2">
                    {trimmed.replace(/^##\s+/, "")}
                  </h3>
                )
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="font-extrabold text-foreground text-base pt-2">
                    {trimmed.replace(/^#\s+/, "")}
                  </h2>
                )
              }

              // Horizontal divider
              if (trimmed === "---" || trimmed === "***") {
                return <hr key={lIdx} className="my-2 border-border/60" />
              }

              // Bullet item
              if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                const bulletText = trimmed.slice(2)
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span className="flex-1">
                      {renderBoldText(bulletText)}
                    </span>
                  </div>
                )
              }

              // Blockquote
              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={lIdx}
                    className="border-l-2 border-indigo-500 pl-3 py-1 my-1 italic text-muted-foreground bg-muted/20 rounded-r-lg"
                  >
                    {renderBoldText(trimmed.replace(/^>\s+/, ""))}
                  </blockquote>
                )
              }

              return <p key={lIdx}>{renderBoldText(trimmed)}</p>
            })}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Parses **bold** and `inline code` tokens inside text lines
 */
function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-[11px] text-indigo-500 border border-border/60"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export const AiChatPage: React.FC = () => {
  const { user } = useAuth()
  // Starts with an empty session box as requested
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [useResumeContext, setUseResumeContext] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickPrompts = [
    {
      title: "Ask me questions",
      desc: "Quiz me with 3 technical interview questions to test my skills",
      prompt: "Ask me 3 challenging technical interview questions to test my knowledge and problem solving. Wait for my answers before evaluating.",
      icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
    },
    {
      title: "Coding & Algorithms",
      desc: "Explain how an LRU Cache works with clean code",
      prompt: "Explain how an LRU Cache works with clean Python and TypeScript code, including time and space complexity.",
      icon: <Code2 className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: "System Design",
      desc: "Design a high-scale real-time notification engine",
      prompt: "How would you design a scalable notification system capable of delivering millions of alerts per minute? Include architecture components and trade-offs.",
      icon: <Cpu className="w-4 h-4 text-cyan-500" />,
    },
    {
      title: "AI & Machine Learning",
      desc: "Explain Transformer Attention mechanisms intuitively",
      prompt: "Explain Multi-Head Self-Attention in Transformers in a clear, intuitive way with a step-by-step mathematical breakdown.",
      icon: <Brain className="w-4 h-4 text-purple-500" />,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput("")
    setLoading(true)

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await chatService.sendMessage(query, historyPayload, useResumeContext)

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: response.suggestedFollowUps,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error("Chat error:", err)
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ I encountered an issue processing that query. Please try again or rephrase your question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleResetChat = () => {
    setMessages([])
    setInput("")
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden">
      {/* Top Bar Header */}
      <div className="p-4 sm:px-6 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground">
                PathLearn AI
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-wider">
                Gemini & Claude
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Intelligent AI Mentor • Ask anything or practice technical questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Resume Context Toggle */}
          <button
            onClick={() => setUseResumeContext(!useResumeContext)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              useResumeContext
                ? "bg-indigo-500/15 text-indigo-500 border-indigo-500/30"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
            title={useResumeContext ? "Personalized context enabled" : "General mode enabled"}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {useResumeContext ? "Resume Context Active" : "General Mode"}
            </span>
            <span className="sm:hidden">{useResumeContext ? "Resume ON" : "General"}</span>
          </button>

          {/* Reset / New Chat */}
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Start new empty chat"
            aria-label="Start new chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area or Empty State Box */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-3xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-sm"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>

            <motion.h2
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-2xl font-bold text-foreground mb-2"
            >
              Ask Pathlearn
            </motion.h2>

            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed"
            >
              Ask anything just like ChatGPT or Claude. You can ask for coding solutions, system design, explanations, or ask me to quiz you on any topic.
            </motion.p>

            {/* Quick Starters Grid */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
            >
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="p-3.5 rounded-2xl bg-card hover:bg-muted/50 border border-border/80 hover:border-indigo-500/40 text-left transition-all group shadow-xs cursor-pointer flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-muted border border-border/60">
                      {item.icon}
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-indigo-500 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {item.desc}
                  </p>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === "user"

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 relative group shadow-xs ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-muted/40 border border-border/80 text-foreground rounded-tl-xs"
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1 border-b border-border/20">
                    <span className="font-semibold">
                      {isUser ? formatDisplayName(user?.name) : "PathLearn AI"}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Content */}
                  <FormattedMessage content={msg.content} />

                  {/* Copy button for Assistant messages */}
                  {!isUser && (
                    <div className="pt-2 flex items-center justify-between border-t border-border/40 text-[11px]">
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Suggested follow-up chips */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Suggested Follow-Ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSendMessage(chip)}
                            className="text-[11px] text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-all text-left flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <span>{chip}</span>
                            <ArrowRight className="w-3 h-3 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            )
          })
        )}

        {/* Loading typing bubble */}
        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-muted/40 border border-border/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-muted-foreground ml-2">PathLearn AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 sm:p-5 border-t border-border/80 bg-card shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask Pathlearn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-muted/30 border border-border/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all shadow-xs"
          />

          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-3 text-xs font-semibold shadow-xs gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AiChatPage
