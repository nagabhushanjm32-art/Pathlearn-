import React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, Award, Sparkles, Mic, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CertificateChecklistProps {
  domainSlug: string
  domainName: string
  roadmapProgress?: number
  quizzesPassedRatio?: string
  quizzesComplete?: boolean
  mockInterviewScore?: number
  mockInterviewPassed?: boolean
}

export const CertificateChecklist: React.FC<CertificateChecklistProps> = ({
  domainSlug,
  domainName,
  roadmapProgress = 0,
  quizzesPassedRatio = "0/12",
  quizzesComplete = false,
  mockInterviewScore = 0,
  mockInterviewPassed = false,
}) => {
  const navigate = useNavigate()

  const isRoadmapDone = roadmapProgress >= 100
  const isInterviewDone = mockInterviewPassed && mockInterviewScore >= 60

  // 3 Core Criteria
  let requirementsMet = 0
  if (isRoadmapDone) requirementsMet++
  if (quizzesComplete) requirementsMet++
  if (isInterviewDone) requirementsMet++

  const isEligible = requirementsMet === 3

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden space-y-4">
      {/* Background Accent Glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Certificate Eligibility
        </h3>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isEligible
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          }`}
        >
          {isEligible ? "🎉 Certificate Ready" : `${requirementsMet} / 3 Criteria`}
        </span>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {/* Requirement 1: Roadmap 100% */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
          <div className="flex items-center gap-2.5">
            {isRoadmapDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="font-medium text-foreground">1. Roadmap completed (100%)</span>
          </div>
          <span className="font-mono font-bold text-muted-foreground">{roadmapProgress}%</span>
        </div>

        {/* Requirement 2: All Quizzes Passed */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
          <div className="flex items-center gap-2.5">
            {quizzesComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="font-medium text-foreground">2. Required quizzes passed</span>
          </div>
          <span className="font-mono font-bold text-muted-foreground">
            {quizzesComplete ? "Passed ✓" : quizzesPassedRatio}
          </span>
        </div>

        {/* Requirement 3: AI Interview >= 60% */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
          <div className="flex items-center gap-2.5">
            {isInterviewDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="font-medium text-foreground">3. AI interview passed (≥60%)</span>
          </div>
          <span className="font-mono font-bold text-muted-foreground">
            {mockInterviewScore > 0 ? `${mockInterviewScore}%` : "Not Taken"}
          </span>
        </div>
      </div>

      {/* Progress Bar for Requirements */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
          <span>Eligibility Status</span>
          <span>{Math.round((requirementsMet / 3) * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(requirementsMet / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-border/60 space-y-2">
        {isEligible ? (
          <Button
            onClick={() => navigate(`/certificate/${domainSlug}`)}
            className="w-full bg-linear-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold gap-2 shadow-sm cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Generate Certificate</span>
            <ArrowRight className="w-3 h-3 ml-auto" />
          </Button>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground">
              {!isRoadmapDone
                ? "Complete all lessons to advance toward your certificate."
                : !quizzesComplete
                ? "Pass the required quizzes to unlock your certificate."
                : "Complete the AI Mock Interview (≥60%) to unlock your certificate."}
            </p>
            <Button
              onClick={() => navigate(`/certificate/${domainSlug}`)}
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold gap-2 border-border text-foreground hover:bg-muted"
            >
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>View Requirements</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default CertificateChecklist
