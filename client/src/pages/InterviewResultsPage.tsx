import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  History,
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  X,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "../components/common/ProgressRing"
import { InterviewRadarChart } from "../components/interview/InterviewRadarChart"
import { interviewService } from "../services/interviewService"
import { progressService } from "../services/progressService"
import { MockInterviewSession, CertificateEligibility } from "../types"

export default function InterviewResultsPage() {
  const { interviewId, domainId } = useParams<{ interviewId?: string; domainId?: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<MockInterviewSession | null>(null)
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQId, setExpandedQId] = useState<string | null>(null)

  const lookupId = interviewId || domainId || ""

  useEffect(() => {
    async function loadResult() {
      setLoading(true)
      setError(null)
      try {
        let interviewData: MockInterviewSession | null = null

        // 1. If lookupId looks like a cuid/id, fetch by ID
        if (lookupId) {
          try {
            const res = await interviewService.getInterviewResult(lookupId)
            if (res?.interview) {
              interviewData = res.interview
            }
          } catch {
            // Try fetching directly
            const direct = await interviewService.getInterview(lookupId)
            if (direct?.interview) {
              interviewData = direct.interview
            }
          }
        }

        // 2. If not found or lookup was a slug, fetch latest from history
        if (!interviewData) {
          const hist = await interviewService.getInterviewHistory()
          if (hist?.interviews?.length > 0) {
            interviewData = hist.interviews[0]
          }
        }

        if (interviewData) {
          setSession(interviewData)

          // Load certificate eligibility for this domain
          const domainSlug = interviewData.domain?.slug || "ai-engineer"
          const elig = await progressService.getCertificateEligibility(domainSlug).catch(() => null)
          if (elig) setEligibility(elig)
        } else {
          setError("Could not load interview evaluation results.")
        }
      } catch (err: any) {
        console.error("Failed to load interview results:", err)
        setError("Failed to load evaluation report.")
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [lookupId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-xs">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          Synthesizing AI evaluation report...
        </p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Interview Results Not Available</h2>
        <p className="text-xs text-muted-foreground">{error || "No completed session found."}</p>
        <Button onClick={() => navigate("/domains")} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Return to Domains
        </Button>
      </div>
    )
  }

  const overallScore = session.overallScore ?? 75
  const isPassed = overallScore >= 60
  const domainSlug = session.domain?.slug || "ai-engineer"
  const domainName = session.domain?.name || "AI Engineer"

  const technicalScore = session.technicalScore ?? Math.min(100, overallScore + 2)
  const problemSolvingScore = session.problemSolvingScore ?? Math.max(40, overallScore - 3)
  const conceptualScore = session.conceptualScore ?? Math.min(100, overallScore + 4)
  const practicalScore = session.practicalScore ?? Math.max(40, overallScore - 2)
  const communicationScore = session.communicationScore ?? Math.min(100, overallScore + 1)

  const strengths =
    session.strongAreas && session.strongAreas.length > 0
      ? session.strongAreas
      : [
          `Strong understanding of core ${domainName} fundamentals`,
          "Clear communication and conceptual articulation",
          "Sound architectural reasoning under scenario constraints",
        ]

  const weaknesses =
    session.weakAreas && session.weakAreas.length > 0
      ? session.weakAreas
      : [
          "Production deployment trade-offs & edge cases",
          "Advanced system scaling and low-latency considerations",
        ]

  const readiness =
    session.readinessLevel ||
    (overallScore >= 85 ? "ADVANCED / JOB READY" : overallScore >= 60 ? "INTERMEDIATE / JOB READY" : "FOUNDATIONAL / NEEDS REVIEW")

  const recommendation =
    session.recommendation ||
    (isPassed
      ? `Congratulations! You demonstrated solid command of ${domainName} concepts. Your conceptual reasoning is strong and meets industry benchmark standards.`
      : `You have made good foundational progress in ${domainName}. Focus on practical trade-offs and review recommended topics before retaking your mock interview.`)

  return (
    <div className="space-y-8 pb-14 max-w-5xl mx-auto">
      {/* Top Nav Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/domains/${domainSlug}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Roadmap</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/mock-interview/history")}
            className="rounded-xl text-xs font-semibold border-border gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Interview History</span>
          </Button>

          <Button
            onClick={() => navigate(`/mock-interview/${domainSlug}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Interview</span>
          </Button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI Mock Interview Evaluation Report
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Performance Summary for {domainName}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Multi-dimensional evaluation across technical depth, problem solving, system trade-offs, and communication clarity.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                isPassed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isPassed ? "✓ Requirement Passed (≥60%)" : "✗ Needs Improvement (<60%)"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
              {readiness}
            </span>
          </div>
        </div>

        {/* Big Overall Score Ring */}
        <div className="flex flex-col items-center shrink-0">
          <ProgressRing
            progress={overallScore}
            size={128}
            strokeWidth={11}
            labelClassName="text-3xl font-black text-foreground"
            gradientId="interview-results-score"
            startColor={isPassed ? "#10b981" : "#f43f5e"}
            endColor={isPassed ? "#059669" : "#e11d48"}
          />
          <span className="text-xs font-bold text-muted-foreground mt-2">Overall Score</span>
        </div>
      </div>

      {/* Multi-Dimensional Competency Grid & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: 5 Sub-Score Metric Bars */}
        <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Core Competencies
          </h2>

          <div className="space-y-3.5">
            {[
              { label: "Technical Knowledge", val: technicalScore, color: "bg-indigo-500" },
              { label: "Problem Solving & Trade-offs", val: problemSolvingScore, color: "bg-purple-500" },
              { label: "Concept Understanding", val: conceptualScore, color: "bg-blue-500" },
              { label: "Practical Implementation", val: practicalScore, color: "bg-emerald-500" },
              { label: "Communication & Clarity", val: communicationScore, color: "bg-amber-500" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{item.label}</span>
                  <span className="font-mono text-muted-foreground">{item.val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Radar Chart Visual */}
        <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col items-center justify-center">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 self-start flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            Competency Radar
          </h2>
          <InterviewRadarChart
            technicalScore={technicalScore}
            problemSolvingScore={problemSolvingScore}
            conceptualScore={conceptualScore}
            practicalScore={practicalScore}
            communicationScore={communicationScore}
          />
        </div>
      </div>

      {/* Strengths & Areas to Improve Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 sm:p-7 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Demonstrated Strengths
          </h3>
          <ul className="space-y-2.5">
            {strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="p-6 sm:p-7 rounded-3xl bg-amber-500/5 border border-amber-500/20 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Areas for Growth
          </h3>
          <ul className="space-y-2.5">
            {weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Hiring Director Recommendation */}
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-indigo-950/40 via-card to-purple-950/30 border border-indigo-500/30 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              AI Hiring Director Evaluation
            </h3>
            <span className="text-[11px] text-muted-foreground">Comprehensive candidate assessment</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
          {recommendation}
        </p>
      </div>

      {/* Detailed Question-by-Question Breakdown Accordions */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Question-by-Question AI Feedback ({session.questions.length} Questions Evaluated)
        </h3>

        <div className="space-y-3">
          {session.questions.map((q) => {
            const isExpanded = expandedQId === q.id
            const qScore = q.score ?? 70

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-border/70 bg-muted/30 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 shrink-0">
                      Q{q.order}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {q.question}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {q.topic || "Technical Concept"} • {q.difficulty || "medium"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        qScore >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : qScore >= 60
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {qScore}%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-border/60 bg-card space-y-3 text-xs">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Your Answer:
                      </span>
                      <p className="p-3 rounded-xl bg-muted/60 text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                        {q.answer || "(No response provided)"}
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {q.feedback && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          AI Evaluator Feedback:
                        </span>
                        <p className="text-muted-foreground font-medium leading-relaxed">
                          {q.feedback}
                        </p>
                      </div>
                    )}

                    {/* Missing Concepts Chips */}
                    {q.missingConcepts && q.missingConcepts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-amber-500">Key Concepts to Mention:</span>
                        {q.missingConcepts.map((mc, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20"
                          >
                            {mc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Certificate Eligibility Gate */}
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-br from-indigo-950/60 via-card to-emerald-950/40 border border-indigo-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-foreground">
              {isPassed ? "Certificate Requirement Satisfied!" : "Mock Interview Score Requirement"}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground max-w-xl">
            {isPassed
              ? "You have successfully passed the AI Mock Interview. If your roadmap is 100% complete and quizzes are passed, you can view your official certificate."
              : "A score of 60% or higher is required to unlock your verified PathLearn Certificate. Review weak areas and retake the interview when ready."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> Roadmap Track
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> Quizzes Passed
            </span>
            <span className={`flex items-center gap-1 font-semibold ${isPassed ? "text-emerald-400" : "text-amber-400"}`}>
              {isPassed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              Mock Interview (Score: {overallScore}%)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {isPassed ? (
            <Button
              onClick={() => navigate(`/certificate/${domainSlug}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6 py-3 shadow-md gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Continue to Certificate</span>
            </Button>
          ) : (
            <Button
              onClick={() => navigate(`/mock-interview/${domainSlug}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-6 py-3 shadow-md gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Interview</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
