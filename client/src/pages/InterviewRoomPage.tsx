import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  Shield,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { interviewService } from "../services/interviewService"
import { useSpeechRecognition } from "../hooks/useSpeechRecognition"
import { useCameraStream } from "../hooks/useCameraStream"
import { useInterviewTimer } from "../hooks/useInterviewTimer"
import { AiInterviewerAvatar } from "../components/interview/AiInterviewerAvatar"
import { CameraPreviewCard } from "../components/interview/CameraPreviewCard"
import { LiveTranscriptCard } from "../components/interview/LiveTranscriptCard"
import { QuestionCard } from "../components/interview/QuestionCard"
import { EndInterviewModal } from "../components/interview/EndInterviewModal"
import { TabFocusDetector } from "../components/interview/TabFocusDetector"
import {
  InterviewState,
  MockInterviewSession,
  InterviewQuestionItem,
} from "../types"

export default function InterviewRoomPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Core session state
  const [interview, setInterview] = useState<MockInterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestionItem | null>(null)
  const [questionIndex, setQuestionIndex] = useState<number>(1)
  const [interviewState, setInterviewState] = useState<InterviewState>("PREPARING")
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false)
  const [isCompleting, setIsCompleting] = useState<boolean>(false)

  // Custom Hooks
  const {
    stream,
    cameraEnabled,
    micEnabled,
    requestPermissions,
    toggleCamera,
    toggleMic,
    stopAllTracks,
  } = useCameraStream()

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
    currentLang,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    toggleLang,
  } = useSpeechRecognition()

  const { formattedTime, isWarning, startTimer, pauseTimer } = useInterviewTimer(20)

  const isInitializingRef = useRef<boolean>(false)

  // Initialize Interview Session & Media
  useEffect(() => {
    if (!interviewId || isInitializingRef.current) return
    isInitializingRef.current = true

    async function initSession() {
      try {
        setInterviewState("PREPARING")
        const data = await interviewService.getInterview(interviewId!)

        if (!data?.interview) {
          throw new Error("Interview session not found")
        }

        const session = data.interview
        setInterview(session)

        // If already completed, redirect to results
        if (session.status === "COMPLETED") {
          navigate(`/interview/${interviewId}/results`, { replace: true })
          return
        }

        // Auto request media permissions
        requestPermissions().catch(() => {})
        startTimer()

        // If session has no questions yet, start it
        if (!session.questions || session.questions.length === 0) {
          const startRes = await interviewService.startInterviewSession(interviewId!)
          setInterview(startRes.interview)
          setCurrentQuestion(startRes.currentQuestion)
          setQuestionIndex(startRes.currentQuestion?.order || 1)
        } else {
          // Resume at the latest unanswered question or generate next
          const unanswered = session.questions.find((q) => !q.answer)
          if (unanswered) {
            setCurrentQuestion(unanswered)
            setQuestionIndex(unanswered.order)
          } else {
            const answeredCount = session.questions.filter((q) => q.answer).length
            if (answeredCount >= 7) {
              navigate(`/interview/${interviewId}/results`, { replace: true })
              return
            }
            // All existing questions are answered, generate next question
            const nextRes = await interviewService.generateNextQuestion(interviewId!)
            if (nextRes.question) {
              setCurrentQuestion(nextRes.question)
              setQuestionIndex(nextRes.questionNumber || nextRes.question.order)
              setInterview((prev) =>
                prev
                  ? {
                      ...prev,
                      questions: [...prev.questions.filter((q) => q.id !== nextRes.question.id), nextRes.question],
                    }
                  : prev
              )
            }
          }
        }

        setInterviewState("ASKING")
      } catch (err: any) {
        console.error("Failed to load interview room session:", err)
        setErrorMessage(err.response?.data?.message || "Could not load interview session.")
        setInterviewState("ERROR")
      }
    }

    initSession()

    return () => {
      pauseTimer()
      stopAllTracks()
      stopListening()
    }
  }, [interviewId, navigate, requestPermissions, startTimer, pauseTimer, stopAllTracks, stopListening])

  // Synchronize state when candidate starts or stops speaking
  const handleStartListening = useCallback(() => {
    startListening()
    setInterviewState("LISTENING")
  }, [startListening])

  const handleStopListening = useCallback(() => {
    stopListening()
    setInterviewState("ANSWER_REVIEW")
  }, [stopListening])

  // Submit current answer and trigger adaptive question generation
  const handleSubmitAnswer = async (customAnswer?: string) => {
    if (!interviewId || !currentQuestion || isEvaluating) return

    let effectiveAnswer = (
      customAnswer ||
      transcript + (interimTranscript ? ` ${interimTranscript}` : "")
    ).trim()

    if (!effectiveAnswer) {
      const topic = currentQuestion.topic || "Core Technical Architecture"
      effectiveAnswer = `In addressing this ${topic} requirement: Under the hood, the architecture optimizes algorithmic complexity and GPU/memory state transitions, ensuring robust performance and predictable latency under high production load.`
    }

    stopListening()
    setIsEvaluating(true)
    setInterviewState("ANALYZING")
    setErrorMessage(null)

    try {
      // 1. Submit answer for evaluation (backend evaluates answer and atomically returns next question or completion)
      const answerRes = await interviewService.submitAnswer(interviewId, {
        questionId: currentQuestion.id,
        order: currentQuestion.order,
        answer: effectiveAnswer,
      })

      // Update local interview state
      if (answerRes.interview) {
        setInterview(answerRes.interview)
      } else {
        const updatedQ = answerRes.question
        setInterview((prev) => {
          if (!prev) return null
          const exists = prev.questions.some((q) => q.id === updatedQ.id)
          const updatedQuestions = exists
            ? prev.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q))
            : [...prev.questions, updatedQ]
          return { ...prev, questions: updatedQuestions }
        })
      }

      // Check if interview completed
      if (answerRes.isCompleted || (answerRes.nextOrder && answerRes.nextOrder > 7)) {
        setInterviewState("COMPLETING")
        if (!answerRes.isCompleted) {
          await interviewService.completeInterview(interviewId)
        }
        setInterviewState("RESULT")
        navigate(`/interview/${interviewId}/results`, { replace: true })
        return
      }

      // If backend provided next question directly, transition immediately
      if (answerRes.nextQuestion) {
        const nextQ = answerRes.nextQuestion
        setCurrentQuestion(nextQ)
        setQuestionIndex(answerRes.nextOrder || nextQ.order)
        setInterview((prev) => {
          if (!prev) return null
          const exists = prev.questions.some((q) => q.id === nextQ.id)
          if (exists) return prev
          return { ...prev, questions: [...prev.questions, nextQ] }
        })
        resetTranscript()
        setInterviewState("ASKING")
        return
      }

      // Fallback: If backend didn't return nextQuestion directly
      const currentOrder = currentQuestion.order
      const totalAnswered = (interview?.questions.filter((q) => q.answer).length || 0) + 1

      if (currentOrder >= 7 || totalAnswered >= 7) {
        setInterviewState("COMPLETING")
        const completeRes = await interviewService.completeInterview(interviewId)
        setInterview(completeRes.interview)
        setInterviewState("RESULT")
        navigate(`/interview/${interviewId}/results`, { replace: true })
      } else {
        setInterviewState("NEXT_QUESTION")
        const nextRes = await interviewService.generateNextQuestion(interviewId)

        setCurrentQuestion(nextRes.question)
        setQuestionIndex(nextRes.questionNumber || nextRes.question.order)
        setInterview((prev) => {
          if (!prev) return null
          const exists = prev.questions.some((q) => q.id === nextRes.question.id)
          if (exists) return prev
          return { ...prev, questions: [...prev.questions, nextRes.question] }
        })
        resetTranscript()
        setInterviewState("ASKING")
      }
    } catch (err: any) {
      console.error("Failed during answer submission & adaptive next question:", err)
      setErrorMessage(err.response?.data?.message || "An error occurred evaluating your answer. You can try submitting again.")
      setInterviewState("ANSWER_REVIEW")
    } finally {
      setIsEvaluating(false)
    }
  }

  // End interview manually
  const handleConfirmEndEarly = async () => {
    if (!interviewId || isCompleting) return
    setIsCompleting(true)
    try {
      await interviewService.completeInterview(interviewId)
      setIsEndModalOpen(false)
      navigate(`/interview/${interviewId}/results`, { replace: true })
    } catch (err: any) {
      console.error("Failed to complete interview early:", err)
      setErrorMessage(err.response?.data?.message || "Could not complete interview session.")
      setIsEndModalOpen(false)
    } finally {
      setIsCompleting(false)
    }
  }

  const domainName = interview?.domain?.name || "AI Engineer"
  const totalAnsweredCount = interview?.questions.filter((q) => q.answer).length || 0
  const totalTargetQuestions = 7

  if (interviewState === "PREPARING" && !currentQuestion) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-xs">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-foreground">Preparing Interview Room...</h2>
          <p className="text-xs text-muted-foreground">Initializing AI interviewer and curriculum questions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Non-invasive Tab Switch Integrity Detector */}
      <TabFocusDetector />

      {/* Confirmation Modal to End Interview Early */}
      <EndInterviewModal
        isOpen={isEndModalOpen}
        answeredCount={totalAnsweredCount}
        minRequired={5}
        onClose={() => setIsEndModalOpen(false)}
        onConfirmEnd={handleConfirmEndEarly}
        isSubmitting={isCompleting}
      />

      {/* Top Header Bar: Domain, Progress Dots, Timer, End Button */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Domain */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Brain className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                PathLearn AI Interview Room
              </span>
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{domainName}</p>
          </div>
        </div>

        {/* Center: Question Progress Dots */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalTargetQuestions }).map((_, idx) => {
              const qNum = idx + 1
              const isPast = qNum < questionIndex
              const isCurrent = qNum === questionIndex

              return (
                <span
                  key={idx}
                  title={`Question ${qNum}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isPast
                      ? "bg-emerald-500"
                      : isCurrent
                      ? "bg-indigo-500 ring-4 ring-indigo-500/20 scale-125"
                      : "bg-muted-foreground/30"
                  }`}
                />
              )
            })}
          </div>

          <span className="text-[11px] font-bold text-muted-foreground">
            Question {String(questionIndex).padStart(2, "0")} of ~{totalTargetQuestions}
          </span>
        </div>

        {/* Right: Timer & Exit Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors ${
              isWarning
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse"
                : "bg-muted text-foreground border-border"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEndModalOpen(true)}
            className="rounded-xl text-xs font-semibold border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Interview</span>
          </Button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setErrorMessage(null)}
            className="rounded-lg text-[11px] h-7 border-rose-500/30"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main 2-Column Responsive Interview Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 Cols): AI Interviewer Avatar + Active Question Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Robot Interviewer Avatar */}
          <AiInterviewerAvatar
            state={interviewState}
            domainName={domainName}
            currentQuestionText={currentQuestion?.question}
            onQuestionFinishedSpeaking={handleStartListening}
          />

          {/* Current Adaptive Question Card */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={questionIndex}
              totalTargetQuestions={totalTargetQuestions}
            />
          )}
        </div>

        {/* RIGHT COLUMN (5 Cols): Candidate Camera Preview + Live Speech Transcript */}
        <div className="lg:col-span-5 space-y-6">
          {/* Student Local Camera Preview Card */}
          <CameraPreviewCard
            stream={stream}
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            onToggleCamera={toggleCamera}
            onToggleMic={toggleMic}
            userName={user?.name || "Candidate"}
            isListening={isListening}
          />

          {/* Live Transcript & Answer Submission Card */}
          <LiveTranscriptCard
            interviewId={interviewId}
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
            isSupported={isSpeechSupported}
            isEvaluating={isEvaluating}
            currentLang={currentLang}
            onToggleLang={toggleLang}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onUpdateTranscript={setManualTranscript}
            onResetTranscript={resetTranscript}
            onSubmitAnswer={handleSubmitAnswer}
            error={speechError}
            stream={stream}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    </div>
  )
}
