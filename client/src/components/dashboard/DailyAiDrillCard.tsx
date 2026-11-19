import React, { useState } from "react"
import { Sparkles, HelpCircle, CheckCircle2, XCircle, ChevronRight, RefreshCw, Lightbulb, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface DrillQuestion {
  id: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  interviewTip: string
}

const DRILL_QUESTIONS: DrillQuestion[] = [
  {
    id: "drill-1",
    category: "AI & Deep Learning",
    difficulty: "Intermediate",
    question: "Why does the Transformer architecture use Multi-Head Attention instead of a single attention head?",
    options: [
      "To reduce the total number of parameters in the model",
      "To jointly attend to information from different representation subspaces at different positions",
      "To prevent gradient vanishing during backpropagation completely",
      "To replace feedforward neural networks entirely",
    ],
    correctIndex: 1,
    explanation:
      "Multi-Head Attention allows the model to simultaneously focus on various parts of the input sequence from different perspective subspaces (e.g. syntactic, semantic, and positional relationships).",
    interviewTip: "In AI interviews, mention how splitting projection into h heads with d_k = d_model / h keeps total computation similar to single-head attention while capturing richer features.",
  },
  {
    id: "drill-2",
    category: "System Design & Scaling",
    difficulty: "Intermediate",
    question: "What is the primary trade-off when using Write-Back (Write-Behind) caching strategy?",
    options: [
      "Higher write latency but zero risk of data loss",
      "Very fast write operations with risk of data loss if cache fails before flushing to DB",
      "Complete elimination of cache invalidation complexity",
      "Requires synchronous writes to both cache and database simultaneously",
    ],
    correctIndex: 1,
    explanation:
      "In Write-Back caching, data is written only to the cache immediately and asynchronously written to the storage later. This gives low write latency but carries a window of data loss risk on cache crash.",
    interviewTip: "Contrast Write-Back with Write-Through (strong consistency, higher latency) and Write-Around (avoids cache pollution for infrequently read data).",
  },
  {
    id: "drill-3",
    category: "Python & Performance",
    difficulty: "Intermediate",
    question: "How does Python's Global Interpreter Lock (GIL) influence multithreading for CPU-bound vs I/O-bound tasks?",
    options: [
      "It accelerates CPU-bound threads through SIMD vectorization",
      "It prevents true parallel CPU execution across cores, but I/O-bound threads release the GIL while waiting",
      "It only applies to async/await coroutines and not standard threading.Thread objects",
      "It automatically turns multithreaded code into multi-process IPC",
    ],
    correctIndex: 1,
    explanation:
      "The GIL ensures only one native thread executes Python bytecode at once. CPU-bound tasks cannot run in parallel across CPU cores using threads (use multiprocessing instead), while I/O operations release the GIL during system calls.",
    interviewTip: "Mention Python 3.13 free-threading (PEP 703) to showcase up-to-date modern Python knowledge!",
  },
  {
    id: "drill-4",
    category: "Machine Learning Foundations",
    difficulty: "Beginner",
    question: "Which regularization technique tends to produce sparse weights (feature selection) by driving non-critical weights to exactly zero?",
    options: [
      "L2 Regularization (Ridge)",
      "L1 Regularization (Lasso)",
      "Dropout with p=0.5",
      "Batch Normalization",
    ],
    correctIndex: 1,
    explanation:
      "L1 regularization adds the absolute sum of weights to the loss function (|w|). The diamond-shaped constraint boundary has sharp corners along coordinate axes, pushing non-essential weights to exactly zero.",
    interviewTip: "L2 (Ridge) shrinks weights toward zero quadratically but rarely sets them to exactly zero, preserving all features.",
  },
]

export const DailyAiDrillCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const current = DRILL_QUESTIONS[currentIndex]

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    setShowExplanation(true)
  }

  const handleNextDrill = () => {
    setSelectedOption(null)
    setIsAnswered(false)
    setShowExplanation(false)
    setCurrentIndex((prev) => (prev + 1) % DRILL_QUESTIONS.length)
  }

  const isCorrect = selectedOption === current.correctIndex

  return (
    <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-950/20 via-card to-purple-950/15 border border-indigo-500/30 shadow-xs relative overflow-hidden space-y-4">
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">AI Daily Rapid Drill</span>
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.2 rounded-full border border-indigo-500/20">
                {current.category}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">{current.difficulty} • 60s Concept Check</span>
          </div>
        </div>

        <button
          onClick={handleNextDrill}
          className="p-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Try another question"
          aria-label="Next question"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Question */}
      <div className="space-y-1.5 relative z-10">
        <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
          {current.question}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-2 relative z-10">
        {current.options.map((option, idx) => {
          const isSelected = selectedOption === idx
          const isThisCorrect = idx === current.correctIndex

          let optionStyle = "bg-muted/30 hover:bg-muted/60 border-border/60 text-foreground"
          if (isAnswered) {
            if (isThisCorrect) {
              optionStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold"
            } else if (isSelected) {
              optionStyle = "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-semibold"
            } else {
              optionStyle = "bg-muted/20 border-border/40 text-muted-foreground opacity-60"
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${optionStyle}`}
            >
              <span className="w-5 h-5 rounded-lg bg-card border border-border/70 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-snug">{option}</span>
              {isAnswered && isThisCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              )}
              {isAnswered && isSelected && !isThisCorrect && (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation & Interview Tip */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl bg-muted/50 border border-border/70 space-y-2 text-xs relative z-10"
          >
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Spot on! +15 XP
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Correct Answer: Option {String.fromCharCode(65 + current.correctIndex)}
                </span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {current.explanation}
            </p>
            <div className="pt-1.5 border-t border-border/50 text-[10px] text-indigo-400 flex items-start gap-1.5 font-medium">
              <span className="font-bold shrink-0 uppercase tracking-wider">💡 Interview Tip:</span>
              <span>{current.interviewTip}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleNextDrill}
                variant="outline"
                className="text-xs h-7 px-3 rounded-lg border-border gap-1 font-medium"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DailyAiDrillCard
