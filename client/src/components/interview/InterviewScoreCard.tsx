import React from "react"
import { ProgressRing } from "../common/ProgressRing"
import { CheckCircle2, AlertCircle, Sparkles, TrendingUp, ArrowRight } from "lucide-react"
import { MockInterviewResult } from "../../types"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface InterviewScoreCardProps {
  result: MockInterviewResult
}

export const InterviewScoreCard: React.FC<InterviewScoreCardProps> = ({ result }) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Interview Evaluation Completed
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Here's your performance summary for {result.domainName}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            AI evaluated your theoretical depth, coding syntax, and practical problem-solving trade-offs.
          </p>
        </div>

        {/* Big Circular Score */}
        <div className="flex flex-col items-center shrink-0">
          <ProgressRing
            progress={result.overallScore}
            size={120}
            strokeWidth={10}
            labelClassName="text-2xl font-black text-foreground"
            gradientId="interview-overall-score"
            startColor="#10b981"
            endColor="#059669"
          />
          <span className="text-xs font-semibold text-muted-foreground mt-2">
            Overall Score
          </span>
        </div>
      </div>

      {/* Grid: Strengths vs Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Strengths
          </h3>
          <ul className="space-y-2.5">
            {result.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-2.5">
            {result.areasToImprove.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-wise Breakdown */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Question-wise Breakdown
        </h3>

        <div className="space-y-3.5">
          {result.questionBreakdown.map((q) => (
            <div key={q.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-foreground">
                  Q{q.questionNumber}: {q.topic}
                </span>
                <span className="font-semibold text-muted-foreground">{q.score}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    q.score >= 80
                      ? "bg-emerald-500"
                      : q.score >= 70
                      ? "bg-indigo-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${q.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-0.5">
              AI Recommendation
            </h4>
            <p className="text-xs text-foreground font-medium max-w-xl">
              {result.aiRecommendation}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/domains/${result.domainId}`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 gap-1.5"
        >
          Return to Roadmap
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default InterviewScoreCard
