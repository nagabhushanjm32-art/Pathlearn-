import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  FileText,
  HelpCircle,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Award,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Flame,
  Info,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { roadmapService } from "../services/roadmapService"
import { progressService } from "../services/progressService"
import { fetchNotes } from "../services/notes"
import { fetchOrGenerateQuiz, submitQuizAttempt } from "../services/quiz"
import { StepDetail, StepNote, StepQuiz, QuizAttemptResult } from "../types"
import { Button } from "@/components/ui/button"

export default function LearnPage() {
  const { stepId } = useParams<{ stepId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [step, setStep] = useState<StepDetail | null>(null)
  const [notes, setNotes] = useState<StepNote | null>(null)
  const [quiz, setQuiz] = useState<StepQuiz | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<QuizAttemptResult | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const [activeTab, setActiveTab] = useState<"notes" | "quiz" | "resources">("notes")
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoCompleted, setVideoCompleted] = useState(false)
  const [stepCompleted, setStepCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    whatIsIt: true,
    keyConcepts: true,
    howItWorks: true,
    importantTerms: true,
    example: true,
    takeaways: true,
    interviewTip: true,
  })

  const playerRef = useRef<any>(null)
  const watchIntervalRef = useRef<any>(null)

  // 1. Fetch step details from API
  useEffect(() => {
    if (!stepId) return

    async function loadStepData() {
      setLoading(true)
      try {
        const stepData = await roadmapService.getStepDetails(stepId!)
        if (stepData) {
          setStep(stepData)
          setVideoProgress(stepData.videoProgress || 0)
          setVideoCompleted(stepData.videoCompleted || stepData.videoProgress >= 90)
          setStepCompleted(stepData.isCompleted || false)
        }
      } catch (err) {
        console.error("Failed to load step details:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStepData()
  }, [stepId])

  // 2. Fetch AI Notes when step is loaded
  useEffect(() => {
    if (!stepId) return

    async function loadNotes() {
      setNotesLoading(true)
      try {
        const notesData = await fetchNotes(stepId!)
        setNotes(notesData)
      } catch (err) {
        console.error("Failed to load AI notes:", err)
      } finally {
        setNotesLoading(false)
      }
    }

    loadNotes()
  }, [stepId])

  // 3. Fetch Quiz when quiz tab is clicked or on load
  useEffect(() => {
    if (!stepId) return

    async function loadQuiz() {
      setQuizLoading(true)
      try {
        const quizData = await fetchOrGenerateQuiz(stepId!)
        setQuiz(quizData)
      } catch (err) {
        console.error("Failed to load quiz:", err)
      } finally {
        setQuizLoading(false)
      }
    }

    loadQuiz()
  }, [stepId])

  // 4. Initialize YouTube Iframe Player API for watch tracking
  useEffect(() => {
    if (!step?.video?.youtubeId) return

    let isMounted = true

    function initYouTubePlayer() {
      if ((window as any).YT && (window as any).YT.Player) {
        if (playerRef.current) {
          try {
            playerRef.current.destroy()
          } catch {
            // ignore cleanup errors
          }
        }

        playerRef.current = new (window as any).YT.Player("youtube-player-frame", {
          videoId: step?.video?.youtubeId,
          playerVars: {
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onStateChange: (event: any) => {
              // Playing state (1)
              if (event.data === 1) {
                startWatchTracking()
              } else {
                stopWatchTracking()
              }
            },
          },
        })
      } else {
        // Load YouTube IFrame API script dynamically if not yet loaded
        const existingScript = document.getElementById("youtube-iframe-api")
        if (!existingScript) {
          const tag = document.createElement("script")
          tag.id = "youtube-iframe-api"
          tag.src = "https://www.youtube.com/iframe_api"
          const firstScriptTag = document.getElementsByTagName("script")[0]
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
        }

        (window as any).onYouTubeIframeAPIReady = () => {
          if (isMounted) {
            initYouTubePlayer()
          }
        }
      }
    }

    initYouTubePlayer()

    return () => {
      isMounted = false
      stopWatchTracking()
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // ignore
        }
      }
    }
  }, [step?.video?.youtubeId])

  const startWatchTracking = () => {
    stopWatchTracking()
    watchIntervalRef.current = setInterval(async () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        const currentTime = playerRef.current.getCurrentTime() || 0
        const duration = playerRef.current.getDuration() || 1
        if (duration > 0) {
          const calculatedPct = Math.min(100, Math.round((currentTime / duration) * 100))
          setVideoProgress((prev) => {
            const next = Math.max(prev, calculatedPct)
            if (next >= 90 && !videoCompleted) {
              setVideoCompleted(true)
            }
            return next
          })

          // Sync progress with backend
          if (stepId && calculatedPct > 0) {
            try {
              const res = await progressService.trackWatchProgress(stepId, calculatedPct)
              if (res?.videoCompleted) {
                setVideoCompleted(true)
              }
              if (res?.stepCompleted) {
                setStepCompleted(true)
              }
            } catch (e) {
              console.warn("Watch progress sync error:", e)
            }
          }
        }
      }
    }, 5000)
  }

  const stopWatchTracking = () => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current)
      watchIntervalRef.current = null
    }
  }

  const handleSimulateWatch = async (targetPct: number) => {
    setVideoProgress(targetPct)
    if (targetPct >= 90) {
      setVideoCompleted(true)
    }
    if (stepId) {
      try {
        const res = await progressService.trackWatchProgress(stepId, targetPct)
        if (res?.videoCompleted) setVideoCompleted(true)
        if (res?.stepCompleted) setStepCompleted(true)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleManualMarkComplete = async () => {
    if (!stepId) return
    try {
      await progressService.markStepComplete(stepId)
      setStepCompleted(true)
      setVideoCompleted(true)
      setVideoProgress(100)
    } catch (err) {
      console.error("Failed to complete step:", err)
    }
  }

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (quizAttempt) return
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    })
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || !stepId) return
    setIsSubmittingQuiz(true)
    try {
      const answersPayload = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: selectedAnswers[q.id] ?? -1,
      }))
      const res = await submitQuizAttempt(quiz.id, answersPayload)
      setQuizAttempt(res.attempt)
      if (res.attempt.isPassed) {
        if (videoCompleted) {
          setStepCompleted(true)
        }
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err)
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (loading && !step) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Loading learning module & resources...
        </p>
      </div>
    )
  }

  if (!step) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-base font-bold text-foreground">Step not found or locked.</p>
        <Button onClick={() => navigate("/domains")}>Return to Domains</Button>
      </div>
    )
  }

  const stepNumberStr = String(step.order).padStart(2, "0")
  const totalQuestions = quiz?.questions?.length || 5
  const answeredCount = Object.keys(selectedAnswers).length
  const allAnswered = quiz ? answeredCount === quiz.questions.length : false
  const isQuizPassed = quizAttempt?.isPassed || (quiz?.isPassed ?? false)
  const canComplete = videoCompleted && (!quiz || isQuizPassed)

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/domains/${step.domainSlug}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to {step.domainName} Roadmap</span>
        </button>

        <div className="flex items-center gap-2">
          {step.prevStepId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/${step.prevStepId}`)}
              className="rounded-xl text-xs gap-1 border-border text-foreground hover:bg-muted"
            >
              Previous Step
            </Button>
          )}

          {step.nextStepId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/${step.nextStepId}`)}
              className="rounded-xl text-xs gap-1 border-border text-foreground hover:bg-muted"
            >
              Next Step
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Learning Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2 Cols): Video Player + Tabbed Content (Notes, Quiz, Resources) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Video Player Container */}
          <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-md">
            {/* Embedded Responsive YouTube Player */}
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
              <div id="youtube-player-frame" className="w-full h-full" />
            </div>

            {/* Video Controls & Watch Progress Bar */}
            <div className="p-5 sm:p-6 space-y-4 bg-card border-t border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                      Curated Technical Lesson
                    </span>
                    {videoCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Video Completed (≥90%)
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    {step.video.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Instructor / Channel: <strong className="text-foreground font-semibold">{step.video.channel}</strong>
                  </p>
                </div>

                {/* Simulated Watch Quick Buttons for Dev/Testing */}
                <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                  <span className="text-[10px] text-muted-foreground mr-1">Simulate Watch:</span>
                  {[50, 90, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleSimulateWatch(pct)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                        videoProgress >= pct
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-muted text-muted-foreground border-border/60 hover:bg-muted/80"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Slider / Meter */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                    Watch Progress
                  </span>
                  <span className="font-mono font-bold text-indigo-500">{videoProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      videoCompleted
                        ? "bg-emerald-500"
                        : "bg-linear-to-r from-indigo-500 to-purple-500"
                    }`}
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Watch at least 90% to complete the video requirement for this lesson.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Below Video Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/80 shadow-xs">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "notes"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Study Notes</span>
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "quiz"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Step Quiz</span>
              {isQuizPassed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "resources"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Resources</span>
            </button>
          </div>

          {/* 3. Tab Contents */}

          {/* TAB A: AI STUDY NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-5">
              {notesLoading && !notes ? (
                <div className="p-12 text-center space-y-3 rounded-2xl bg-card border border-border/80">
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    Generating comprehensive AI study notes...
                  </p>
                </div>
              ) : notes ? (
                <div className="space-y-4">
                  {/* Header Banner */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2 relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Curated AI Study Guide</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                      {notes.topic || step.title}
                    </h3>
                  </div>

                  {/* Section 1: What is it? */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                    <button
                      onClick={() => toggleSection("whatIsIt")}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs flex items-center justify-center font-mono">
                          1
                        </span>
                        What is it?
                      </h4>
                      {expandedSections.whatIsIt ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.whatIsIt && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8">
                        {notes.whatIsIt || notes.summary}
                      </p>
                    )}
                  </div>

                  {/* Section 2: Key Concepts */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                    <button
                      onClick={() => toggleSection("keyConcepts")}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs flex items-center justify-center font-mono">
                          2
                        </span>
                        Key Concepts
                      </h4>
                      {expandedSections.keyConcepts ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.keyConcepts && (
                      <div className="space-y-2 pl-8">
                        {(notes.keyConcepts || []).map((concept, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            <span>{concept}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 3: How it Works */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                    <button
                      onClick={() => toggleSection("howItWorks")}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs flex items-center justify-center font-mono">
                          3
                        </span>
                        How it Works
                      </h4>
                      {expandedSections.howItWorks ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.howItWorks && (
                      <div className="space-y-3 pl-8">
                        {(notes.howItWorks || []).map((stepDesc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-3"
                          >
                            <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-foreground font-medium">
                              {stepDesc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Important Terms */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                    <button
                      onClick={() => toggleSection("importantTerms")}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs flex items-center justify-center font-mono">
                          4
                        </span>
                        Important Terms
                      </h4>
                      {expandedSections.importantTerms ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.importantTerms && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                        {(notes.importantTerms || []).map((t, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs font-bold text-indigo-500 block">{t.term}</span>
                            <p className="text-xs text-muted-foreground">{t.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 5: Practical Example & Code */}
                  {notes.example && (
                    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                      <button
                        onClick={() => toggleSection("example")}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs flex items-center justify-center font-mono">
                            5
                          </span>
                          Practical Example
                        </h4>
                        {expandedSections.example ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      {expandedSections.example && notes.example && (
                        <div className="space-y-3 pl-8">
                          {notes.example.explanation && (
                            <p className="text-xs text-muted-foreground">{notes.example.explanation}</p>
                          )}
                          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                              <span>{notes.example.language || "python"}</span>
                              <button
                                onClick={() => notes.example?.code && handleCopyCode(notes.example.code)}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                              >
                                {copiedCode ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="leading-relaxed">{notes.example.code}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 6: Key Takeaways */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                    <button
                      onClick={() => toggleSection("takeaways")}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs flex items-center justify-center font-mono">
                          6
                        </span>
                        Key Takeaways
                      </h4>
                      {expandedSections.takeaways ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSections.takeaways && (
                      <div className="space-y-2.5 pl-8">
                        {(notes.keyTakeaways || []).map((point, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-foreground font-medium">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 7: Interview Tip */}
                  {notes.interviewTip && (
                    <div className="p-6 rounded-2xl bg-linear-to-r from-amber-500/10 via-card to-amber-500/5 border border-amber-500/30 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <Flame className="w-4 h-4" />
                        <span>Technical Interview Tip</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium pl-6">
                        {notes.interviewTip}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl bg-card border border-border/80">
                  Notes are currently unavailable for this step.
                </div>
              )}
            </div>
          )}

          {/* TAB B: STEP QUIZ */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              {quizLoading && !quiz ? (
                <div className="p-12 text-center space-y-3 rounded-2xl bg-card border border-border/80">
                  <HelpCircle className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    Preparing interactive quiz questions...
                  </p>
                </div>
              ) : quiz ? (
                <div className="space-y-6">
                  {/* Quiz Header Banner */}
                  <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Module Assessment</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {step.title} Quiz
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        5 multiple-choice questions • Passing score: {quiz.passingScore}%
                      </p>
                    </div>

                    {isQuizPassed && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>PASSED ({quizAttempt?.percentage || quiz.bestScore || 100}%)</span>
                      </div>
                    )}
                  </div>

                  {/* Attempt Results Banner */}
                  {quizAttempt && (
                    <div
                      className={`p-6 rounded-2xl border text-center space-y-2 animate-in zoom-in-95 ${
                        quizAttempt.isPassed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      }`}
                    >
                      <div className="text-2xl font-black">{quizAttempt.percentage}% Score</div>
                      <p className="text-xs font-bold">
                        {quizAttempt.isPassed
                          ? `🎉 PASSED! You got ${quizAttempt.score} of ${quizAttempt.totalCount} correct.`
                          : `Score ${quizAttempt.percentage}%. You need 60% to pass. Review the AI notes and try again!`}
                      </p>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-5">
                    {quiz.questions.map((q, qIdx) => {
                      const selected = selectedAnswers[q.id]
                      const answerAttempt = quizAttempt?.answers.find((a) => a.questionId === q.id)
                      const isCorrect = answerAttempt ? answerAttempt.isCorrect : false

                      return (
                        <div
                          key={q.id}
                          className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {qIdx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-foreground leading-relaxed">
                              {q.question}
                            </h4>
                          </div>

                          {/* Options */}
                          <div className="space-y-2.5 pl-9">
                            {q.options.map((opt, optIdx) => {
                              let style = "border-border hover:bg-muted/60 text-foreground"
                              if (selected === optIdx) {
                                style = "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold ring-1 ring-indigo-500/30"
                              }
                              if (quizAttempt) {
                                if (optIdx === q.correctIndex) {
                                  style = "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold ring-1 ring-emerald-500/30"
                                } else if (selected === optIdx) {
                                  style = "border-rose-500 bg-rose-500/10 text-rose-500 font-semibold"
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={Boolean(quizAttempt)}
                                  onClick={() => handleSelectAnswer(q.id, optIdx)}
                                  className={`w-full p-3.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between gap-3 ${style}`}
                                >
                                  <span>{opt}</span>
                                  {quizAttempt && optIdx === q.correctIndex && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  )}
                                </button>
                              )
                            })}
                          </div>

                          {/* Explanation after submission */}
                          {quizAttempt && (
                            <div className="mt-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground pl-9 space-y-1">
                              <span className="font-bold text-foreground">Explanation:</span>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Quiz Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    {quizAttempt ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizAttempt(null)
                          setSelectedAnswers({})
                        }}
                        className="rounded-xl text-xs font-semibold gap-2 border-border text-foreground hover:bg-muted"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retake Quiz
                      </Button>
                    ) : (
                      <Button
                        disabled={!allAnswered || isSubmittingQuiz}
                        onClick={handleSubmitQuiz}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-semibold shadow-xs"
                      >
                        {isSubmittingQuiz
                          ? "Grading Assessment..."
                          : allAnswered
                          ? "Submit Answers & Record Score"
                          : `Select All Answers (${answeredCount}/${totalQuestions})`}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl bg-card border border-border/80">
                  Quiz not available for this step.
                </div>
              )}
            </div>
          )}

          {/* TAB C: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Lesson Learning Resources
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">{step.video.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        YouTube Technical Tutorial • Channel: {step.video.channel}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(step.video.url, "_blank")}
                      className="rounded-xl text-xs gap-1 border-border text-foreground hover:bg-muted shrink-0"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>

                  {(step.resources || []).map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-foreground">{res.title}</h4>
                        <p className="text-[11px] text-muted-foreground uppercase">{res.type}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(res.url, "_blank")}
                        className="rounded-xl text-xs gap-1 border-border text-foreground hover:bg-muted shrink-0"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (1 Col): Step Overview, Requirements & Navigation */}
        <div className="space-y-6">
          {/* Step Summary Card */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-500 tracking-wider uppercase">
                Step {stepNumberStr} of {step.totalStepsInRoadmap}
              </span>
              <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border/60">
                {step.difficulty}
              </span>
            </div>

            <h1 className="text-lg font-extrabold text-foreground tracking-tight leading-snug">
              {step.title}
            </h1>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {step.estimatedMinutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {step.domainName}
              </span>
            </div>
          </div>

          {/* Learning Objectives Checklist */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Learning Objectives
            </h3>

            <div className="space-y-2">
              {(step.learningObjectives || []).map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Gained */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Skills Gained
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {step.skillsGained.map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-semibold bg-muted/80 text-foreground px-2.5 py-1 rounded-xl border border-border/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Step Completion Requirement Checklist Card */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Step Completion Status
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  stepCompleted
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}
              >
                {stepCompleted ? "COMPLETED ✓" : "IN PROGRESS"}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Requirement 1: Video Watched >= 90% */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      videoCompleted ? "text-emerald-500" : "text-amber-500"
                    }`}
                  />
                  <span>Watch Video (≥ 90%)</span>
                </div>
                <span className="font-mono font-bold text-muted-foreground">
                  {videoProgress}% {videoCompleted && "✓"}
                </span>
              </div>

              {/* Requirement 2: Quiz Passed */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isQuizPassed ? "text-emerald-500" : "text-muted-foreground"
                    }`}
                  />
                  <span>Pass Step Quiz (≥ 60%)</span>
                </div>
                <span className="font-mono font-bold text-muted-foreground">
                  {isQuizPassed ? "Passed ✓" : "Required"}
                </span>
              </div>
            </div>

            {/* Mark Step Complete Button */}
            <Button
              disabled={stepCompleted}
              onClick={handleManualMarkComplete}
              className={`w-full rounded-xl text-xs font-semibold py-2.5 shadow-xs transition-all ${
                stepCompleted
                  ? "bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-default"
                  : canComplete
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  : "bg-muted text-muted-foreground border border-border/60 hover:bg-muted/80"
              }`}
            >
              {stepCompleted ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Step Completed
                </>
              ) : (
                "Mark Step Complete"
              )}
            </Button>

            {step.nextStepId && (
              <Button
                onClick={() => navigate(`/learn/${step.nextStepId}`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
              >
                <span>Continue to Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
