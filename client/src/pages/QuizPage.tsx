import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { generateQuizForStep, submitQuiz, type Quiz, type QuizAttempt } from "../services/quiz"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ArrowLeft, Award } from "lucide-react"

const OPTION_LETTERS = ["A", "B", "C", "D"]

export default function QuizPage() {
  const { stepId } = useParams<{ stepId: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizAttempt | null>(null)

  useEffect(() => {
    if (!stepId) return
    generateQuizForStep(stepId)
      .then(setQuiz)
      .catch(() => setError("Could not load quiz"))
      .finally(() => setLoading(false))
  }, [stepId])

  function selectOption(questionId: string, index: number) {
    setSelections((prev) => ({ ...prev, [questionId]: index }))
  }

  async function handleSubmit() {
    if (!quiz) return
    setSubmitting(true)
    setError("")
    try {
      const answers = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: selections[q.id] ?? -1,
      }))
      const attempt = await submitQuiz(quiz.id, answers)
      setResult(attempt)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-neutral-500 text-sm">Preparing your quiz...</p>
        </div>
      </div>
    )
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!quiz) return null

  // -- Results view --------------------------------------
  if (result) {
    const percentage = Math.round((result.score / result.totalCount) * 100)
    const scoreColor = percentage >= 80 ? "text-green-400" : percentage >= 50 ? "text-yellow-400" : "text-red-400"
    const ringColor = percentage >= 80 ? "border-green-500/40" : percentage >= 50 ? "border-yellow-500/40" : "border-red-500/40"

    return (
      <div className="min-h-screen bg-black text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className={`w-24 h-24 rounded-full border-4 ${ringColor} flex items-center justify-center mx-auto mb-5 bg-neutral-950`}>
              <Award className={`w-9 h-9 ${scoreColor}`} />
            </div>
            <div className={`text-4xl font-bold mb-1 ${scoreColor}`}>
              {result.score}/{result.totalCount}
            </div>
            <p className="text-neutral-400 text-sm">
              {percentage >= 80
                ? "Great Work! Your understanding is strong."
                : percentage >= 50
                ? "Good effort — review the explanations below."
                : "Keep practicing — review the explanations below."}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {result.answers.map((answer, i) => (
              <div
                key={answer.quizQuestionId}
                className={`border rounded-2xl p-5 ${
                  answer.isCorrect ? "border-green-900/50 bg-green-950/20" : "border-red-900/50 bg-red-950/20"
                }`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  {answer.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                      Question {i + 1}
                    </p>
                    <p className="font-medium leading-snug">{answer.quizQuestion.question}</p>
                  </div>
                </div>

                {!answer.isCorrect && (
                  <div className="pl-8 mb-2 text-sm">
                    <span className="text-neutral-500">Correct answer: </span>
                    <span className="text-green-400 font-medium">
                      {OPTION_LETTERS[answer.quizQuestion.correctIndex]}. {answer.quizQuestion.options[answer.quizQuestion.correctIndex]}
                    </span>
                  </div>
                )}

                <p className="text-sm text-neutral-400 pl-8 leading-relaxed">{answer.quizQuestion.explanation}</p>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={() => navigate(-1)}>
            Back to Roadmap
          </Button>
        </div>
      </div>
    )
  }

  // -- Question view -------------------------------------
  const question = quiz.questions[currentIndex]
  const selected = selections[question.id]
  const isLast = currentIndex === quiz.questions.length - 1
  const allAnswered = quiz.questions.every((q) => selections[q.id] !== undefined)

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit quiz
        </button>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
            </span>
          </div>
          <div className="flex gap-1.5 mb-7">
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i === currentIndex
                    ? "bg-white"
                    : selections[quiz.questions[i].id] !== undefined
                    ? "bg-neutral-500"
                    : "bg-neutral-800"
                }`}
              />
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-7 leading-relaxed">{question.question}</h2>

          <div className="space-y-2.5 mb-8">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectOption(question.id, i)}
                className={`w-full flex items-center gap-3.5 text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-150 ${
                  selected === i
                    ? "border-white bg-white text-black font-medium shadow-[0_0_0_3px_rgba(255,255,255,0.15)]"
                    : "border-neutral-700 bg-neutral-900 text-white hover:border-neutral-500 hover:bg-neutral-800"
                }`}
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    selected === i ? "bg-black text-white border-black" : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  {OPTION_LETTERS[i]}
                </span>
                {option}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            {currentIndex > 0 && (
              <Button variant="secondary" className="flex-1" onClick={() => setCurrentIndex((i) => i - 1)}>
                Previous
              </Button>
            )}
            {!isLast && (
              <Button className="flex-1" disabled={selected === undefined} onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
              </Button>
            )}
            {isLast && (
              <Button className="flex-1" disabled={!allAnswered || submitting} onClick={handleSubmit}>
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
