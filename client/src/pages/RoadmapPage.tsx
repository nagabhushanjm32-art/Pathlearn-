import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Brain,
  Code,
  BarChart3,
  Globe,
  Sparkles,
  Database,
  Mic,
  Lock,
  Layers,
  CheckCircle2,
  Cpu,
  Search,
  BookOpen
} from "lucide-react"
import { ProgressRing } from "../components/common/ProgressRing"
import { RoadmapStep } from "../components/roadmap/RoadmapStep"
import { CertificateChecklist } from "../components/roadmap/CertificateChecklist"
import { roadmapService } from "../services/roadmapService"
import { progressService } from "../services/progressService"
import { Roadmap as RoadmapType, CertificateEligibility } from "../types"
import { Button } from "@/components/ui/button"

export default function RoadmapPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()

  const currentSlug = domainId || "ai-engineer"
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null)
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)

  useEffect(() => {
    async function loadRoadmap() {
      setLoading(true)
      try {
        const [roadmapData, eligData] = await Promise.all([
          roadmapService.getRoadmap(currentSlug),
          progressService.getCertificateEligibility(currentSlug).catch(() => null),
        ])
        if (roadmapData) {
          setRoadmap(roadmapData)
        }
        if (eligData) {
          setEligibility(eligData)
        }
      } catch (err: any) {
        console.error("Failed to load roadmap, checking generation:", err)
      } finally {
        setLoading(false)
      }
    }
    loadRoadmap()
  }, [currentSlug])

  const handleGenerateRoadmap = async () => {
    setGenerating(true)
    setGenerationStep(0)

    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 1200)

    try {
      const newRoadmap = await roadmapService.generateRoadmap(currentSlug)
      setRoadmap(newRoadmap)
      const eligData = await progressService.getCertificateEligibility(currentSlug).catch(() => null)
      if (eligData) setEligibility(eligData)
    } catch (err) {
      console.error("Failed to generate roadmap:", err)
    } finally {
      clearInterval(interval)
      setGenerating(false)
    }
  }

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    if (!roadmap) return
    try {
      await roadmapService.toggleStepCompletion(currentSlug, stepId, completed)
      // Reload roadmap data to ensure sync with backend unlocks and recalculations
      const updated = await roadmapService.getRoadmap(currentSlug)
      if (updated) setRoadmap(updated)
      const eligData = await progressService.getCertificateEligibility(currentSlug).catch(() => null)
      if (eligData) setEligibility(eligData)
    } catch (err) {
      console.error("Failed to toggle step:", err)
    }
  }

  const getDomainIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "brain":
        return <Brain className="w-8 h-8 text-purple-500" />
      case "code":
      case "code2":
        return <Code className="w-8 h-8 text-blue-500" />
      case "barchart3":
      case "bar-chart-3":
        return <BarChart3 className="w-8 h-8 text-cyan-500" />
      case "globe":
        return <Globe className="w-8 h-8 text-emerald-500" />
      case "sparkles":
        return <Sparkles className="w-8 h-8 text-pink-500" />
      case "database":
        return <Database className="w-8 h-8 text-amber-500" />
      default:
        return <Brain className="w-8 h-8 text-indigo-500" />
    }
  }

  // 1. Animated Generating / Loading Experience
  if (generating) {
    const stepsText = [
      { label: "Analyzing domain skills & prerequisite graph", icon: Cpu },
      { label: "Curating sequential engineering topics", icon: Search },
      { label: "Integrating educational video resources & transcripts", icon: BookOpen },
      { label: "Preparing personalized roadmap & study notes", icon: Sparkles },
    ]

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-indigo-500/30 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Building Your Personalized Roadmap
            </h2>
            <p className="text-xs text-muted-foreground">
              Our AI curriculum engine is architecting a structured learning path for you.
            </p>
          </div>

          <div className="space-y-3 text-left pt-2">
            {stepsText.map((st, idx) => {
              const Icon = st.icon
              const isDone = generationStep > idx
              const isCurrent = generationStep === idx

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                      : isCurrent
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold animate-pulse"
                      : "bg-muted/30 border-border/40 text-muted-foreground opacity-50"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="text-xs">{st.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (loading && !roadmap) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          Loading learning roadmap...
        </p>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <p className="text-foreground font-bold">No roadmap generated yet for this domain.</p>
        <p className="text-xs text-muted-foreground">
          Click below to generate an AI-curated structured curriculum.
        </p>
        <Button onClick={handleGenerateRoadmap} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Generate Roadmap Now
        </Button>
      </div>
    )
  }

  // Real progress calculations
  const totalStepsCount = roadmap.steps.length
  const completedStepsCount = roadmap.steps.filter((s) => s.isCompleted).length
  const calculatedProgress = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0
  const isInterviewUnlocked = calculatedProgress >= 70

  return (
    <div className="space-y-8 pb-14">
      {/* Back Button */}
      <button
        onClick={() => navigate("/domains")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Domains</span>
      </button>

      {/* Domain Overview Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left Info */}
          <div className="flex items-start gap-4 sm:gap-5 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-muted/80 dark:bg-muted/40 border border-border/70 flex items-center justify-center shrink-0 shadow-xs">
              {getDomainIcon(roadmap.icon)}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {roadmap.domainName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {roadmap.domainDescription}
              </p>

              {/* Target Roles Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Target Roles:</span>
                {roadmap.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Progress & Interview CTA */}
          <div className="flex flex-row sm:flex-row items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/60">
            <div className="flex items-center gap-4">
              <ProgressRing
                progress={calculatedProgress}
                size={84}
                strokeWidth={7}
                labelClassName="text-base font-black text-foreground"
                gradientId="domain-header-ring"
                startColor="#6366f1"
                endColor="#a855f7"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">Your Progress</p>
                <p className="text-[11px] text-muted-foreground">
                  Completed {completedStepsCount} of {totalStepsCount} steps
                </p>
              </div>
            </div>

            {/* AI Mock Interview CTA */}
            <div className="flex flex-col items-end">
              <Button
                onClick={() => navigate(`/mock-interview/${roadmap.domainSlug}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-4 py-2.5 shadow-sm gap-2 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Take AI Mock Interview</span>
              </Button>
              <span className="text-[10px] text-muted-foreground mt-1">
                Adaptive 5–8 questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Roadmap & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Vertical Stepper */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Roadmap Timeline
            </h2>
            <span className="text-xs text-muted-foreground">
              {completedStepsCount}/{totalStepsCount} completed ({calculatedProgress}%)
            </span>
          </div>

          <div className="space-y-4">
            {roadmap.steps.map((step, idx) => (
              <RoadmapStep
                key={step.id}
                step={step}
                index={idx}
                domainSlug={roadmap.domainSlug}
                onToggleComplete={handleToggleStep}
              />
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Skills You'll Gain & Certificate Checklist */}
        <div className="space-y-6">
          {/* Skills You'll Gain Card */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Skills You'll Gain
            </h3>
            <div className="flex flex-wrap gap-2">
              {roadmap.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-semibold bg-muted/80 text-foreground px-3 py-1 rounded-xl border border-border/70 shadow-xs hover:border-indigo-500/30 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certificate Checklist */}
          <CertificateChecklist
            domainSlug={roadmap.domainSlug}
            domainName={roadmap.domainName}
            roadmapProgress={calculatedProgress}
            quizzesPassedRatio={eligibility?.quizzesScoreRatio || `${completedStepsCount}/${totalStepsCount}`}
            quizzesComplete={eligibility?.quizzesPassed || false}
            mockInterviewScore={0}
            mockInterviewPassed={false}
          />
        </div>
      </div>
    </div>
  )
}
