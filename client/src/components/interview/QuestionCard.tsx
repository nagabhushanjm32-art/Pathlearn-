import React from "react"
import { Sparkles, HelpCircle, Layers, ShieldCheck, Terminal, Cpu } from "lucide-react"
import { motion } from "framer-motion"
import { InterviewQuestionItem } from "../../types"

interface QuestionCardProps {
  question: InterviewQuestionItem
  questionNumber: number
  totalTargetQuestions?: number
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalTargetQuestions = 7,
}) => {
  const getDifficultyBadge = (diff?: string | null) => {
    const d = (diff || "medium").toLowerCase()
    switch (d) {
      case "easy":
        return {
          label: "Easy",
          className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        }
      case "hard":
        return {
          label: "Hard",
          className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        }
      case "expert":
        return {
          label: "Expert",
          className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        }
      default:
        return {
          label: "Medium",
          className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        }
    }
  }

  const getQuestionTypeBadge = (type?: string | null) => {
    const t = (type || "conceptual").toLowerCase()
    switch (t) {
      case "scenario":
      case "scenario_based":
        return "Scenario Based"
      case "debugging":
        return "Edge Case & Debugging"
      case "system_design":
        return "System Design & Architecture"
      case "project_based":
        return "Project Implementation"
      case "problem_solving":
        return "Problem Solving"
      case "practical":
        return "Practical Application"
      default:
        return "Conceptual Theory"
    }
  }

  const diffBadge = getDifficultyBadge(question.difficulty)
  const typeLabel = getQuestionTypeBadge(question.questionType)

  return (
    <motion.div
      key={question.id || questionNumber}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-md space-y-4 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Question {String(questionNumber).padStart(2, "0")}
          </span>

          <span className="text-[11px] font-semibold text-muted-foreground">
            Topic: <strong className="text-foreground">{question.topic || "Core Domain"}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffBadge.className}`}>
            {diffBadge.label}
          </span>
          <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full border border-border">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="pt-1">
        <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed tracking-tight">
          "{question.question}"
        </h2>
      </div>

      {/* Subtle Hint / Guidance Footer */}
      <div className="pt-2 border-t border-border/40 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>Explain the mechanism, trade-offs, and practical considerations in your response.</span>
      </div>
    </motion.div>
  )
}

export default QuestionCard
