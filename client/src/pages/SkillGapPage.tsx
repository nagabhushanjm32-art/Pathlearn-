import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Target,
  Sparkles,
  Check,
  RefreshCw,
  Clock,
  BookOpen,
  Briefcase,
  AlertTriangle,
  Layers,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { careerService } from "../services/careerService"
import { SkillGapItem } from "../types"

export default function SkillGapPage() {
  const navigate = useNavigate()
  const [targetRole, setTargetRole] = useState<string>("AI Engineer")
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [addedSkills, setAddedSkills] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadGaps() {
      try {
        setLoading(true)
        const profileData = await careerService.getCareerProfile()
        const currentRole = profileData.careerProfile?.targetRole || "AI Engineer"
        setTargetRole(currentRole)

        const gapsData = await careerService.getSkillGaps(currentRole)
        if (gapsData?.skillGaps) {
          setSkillGaps(gapsData.skillGaps)
        }
      } catch (err) {
        console.error("Failed to load skill gaps:", err)
      } finally {
        setLoading(false)
      }
    }

    loadGaps()
  }, [])

  const handleAddToRoadmap = async (skillName: string) => {
    try {
      await careerService.personalizeRoadmap(targetRole)
      setAddedSkills((prev) => ({ ...prev, [skillName]: true }))
    } catch (err) {
      console.error("Personalize error:", err)
    }
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto select-none">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/career-profile")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to AI Career Profile</span>
        </button>

        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Target Role: {targetRole}
        </span>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Benchmark Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Your Skill Gap
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comparing your current skills against industry standard requirements for{" "}
            <strong className="text-foreground">{targetRole}</strong>.
          </p>
        </div>

        <Button
          onClick={() => navigate("/career-profile")}
          variant="outline"
          className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted"
        >
          <span>Switch Target Role</span>
        </Button>
      </div>

      {/* Gaps List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Benchmarking skills against industry profile...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {skillGaps.map((gap) => {
            const isStrong = gap.status === "STRONG"
            const isGood = gap.status === "GOOD"
            const isNeedsImp = gap.status === "NEEDS_IMPROVEMENT"

            return (
              <div
                key={gap.skillName}
                className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isStrong
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : isGood
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          : isNeedsImp
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isStrong ? "✓" : isGood ? "✓" : isNeedsImp ? "⚠" : "✗"}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-foreground">{gap.skillName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Current: <strong className="text-foreground">{gap.currentLevel}</strong> • Target:{" "}
                        <strong className="text-indigo-400">{gap.requiredLevel}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        isStrong
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : isGood
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : isNeedsImp
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {gap.currentLevel}
                    </span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {gap.matchPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isStrong
                        ? "bg-emerald-500"
                        : isGood
                        ? "bg-blue-500"
                        : isNeedsImp
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${gap.matchPercentage}%` }}
                  />
                </div>

                {/* AI Explanation & Topics */}
                <div className="pt-2 border-t border-border/60 space-y-3 text-xs">
                  {gap.whyItMatters && (
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Why it matters:</strong> {gap.whyItMatters}
                    </p>
                  )}

                  {gap.recommendedTopics && gap.recommendedTopics.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Recommended PathLearn Topics ({gap.estimatedEffort || "1-2 weeks"}):</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {gap.recommendedTopics.map((topic, idx) => (
                          <div
                            key={topic}
                            className="p-2.5 rounded-xl bg-muted/50 border border-border/60 text-[11px] font-medium text-foreground flex items-center gap-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="truncate">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleAddToRoadmap(gap.skillName)}
                      className={`rounded-xl text-xs h-9 gap-1.5 font-semibold px-4 ${
                        addedSkills[gap.skillName]
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {addedSkills[gap.skillName] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to My Roadmap</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Add to My Roadmap</span>
                        </>
                      )}
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
