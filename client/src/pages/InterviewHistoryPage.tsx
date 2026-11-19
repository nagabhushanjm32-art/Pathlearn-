import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  History,
  Mic,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layers,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { interviewService } from "../services/interviewService"
import { MockInterviewSession } from "../types"

export default function InterviewHistoryPage() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState<MockInterviewSession[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await interviewService.getInterviewHistory()
        if (res?.interviews) {
          setInterviews(res.interviews)
        }
      } catch (err) {
        console.error("Failed to load interview history:", err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Recent"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-8 pb-14 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            Interview Archive
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Your Mock Interview History
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review your past adaptive AI interview sessions, performance breakdowns, and readiness scores.
          </p>
        </div>

        <Button
          onClick={() => navigate("/domains")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs gap-1.5 shrink-0 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Mock Interview</span>
        </Button>
      </div>

      {/* History List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Loading interview archives...
          </p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border/80 shadow-xs text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Mic className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Interviews Completed Yet</h3>
            <p className="text-xs text-muted-foreground">
              Complete an adaptive mock interview to test your technical aptitude and unlock your certificate.
            </p>
          </div>
          <Button
            onClick={() => navigate("/mock-interview/ai-engineer")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
          >
            Start Your First Interview
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => {
            const score = item.overallScore ?? 75
            const isPassed = score >= 60
            const domainName = item.domain?.name || "AI Engineer"
            const domainSlug = item.domain?.slug || "ai-engineer"
            const completedDate = formatDate(item.completedAt || item.startedAt)
            const readiness = item.readinessLevel || (score >= 85 ? "Job Ready" : score >= 60 ? "Intermediate" : "Foundational")

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Left Domain & Meta */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-foreground">
                        {domainName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPassed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {isPassed ? "Passed (≥60%)" : "Needs Review"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {completedDate}
                      </span>
                      <span>•</span>
                      <span>{item.questions?.length || item.totalQuestions || 7} Questions</span>
                      <span>•</span>
                      <span className="text-indigo-400 font-semibold">{readiness}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score Ring & Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-foreground">
                      {score}%
                    </span>
                    <p className="text-[10px] font-bold text-muted-foreground">Overall Score</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate(`/interview/${item.id}/results`)}
                      variant="outline"
                      className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted gap-1.5"
                    >
                      <span>View Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
