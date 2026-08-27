import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchRoadmap, generateRoadmap, completeStep, type Roadmap } from "../services/roadmaps"
import { Button } from "@/components/ui/button"
import {
  Lock,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowLeft,
} from "lucide-react"

const DIFFICULTY_STYLES: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-400 border-green-500/30",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ADVANCED: "bg-red-500/10 text-red-400 border-red-500/30",
}

export default function RoadmapPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  useEffect(() => {
    if (!domainId) return
    fetchRoadmap(domainId)
      .then(setRoadmap)
      .catch(() => setError("Could not load roadmap"))
      .finally(() => setLoading(false))
  }, [domainId])

  async function handleGenerate() {
    if (!domainId) return
    setGenerating(true)
    setError("")
    try {
      const newRoadmap = await generateRoadmap(domainId)
      setRoadmap(newRoadmap)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate roadmap")
    } finally {
      setGenerating(false)
    }
  }

  async function handleComplete(stepId: string) {
    setCompletingId(stepId)
    try {
      const updated = await completeStep(stepId)
      setRoadmap(updated)
      setExpandedStep(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark step complete")
    } finally {
      setCompletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <Sparkles className="w-10 h-10 mx-auto text-neutral-500" />
          <h2 className="text-xl font-bold">No roadmap yet</h2>
          <p className="text-neutral-400 text-sm">
            Let AI generate a personalized learning roadmap for this domain based on your onboarding preferences.
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating your roadmap..." : "Generate AI Roadmap"}
          </Button>
        </div>
      </div>
    )
  }

  const completedCount = roadmap.steps.filter((s) => s.isCompleted).length

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/domains")}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to domains
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Your Learning Roadmap</h1>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${(completedCount / roadmap.steps.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              {completedCount}/{roadmap.steps.length} completed
            </span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-3">
          {roadmap.steps.map((step) => {
            const isExpanded = expandedStep === step.id
            return (
              <div
                key={step.id}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  step.isLocked
                    ? "border-neutral-900 bg-neutral-950/50"
                    : "border-neutral-800 bg-neutral-950"
                }`}
              >
                <button
                  onClick={() => !step.isLocked && setExpandedStep(isExpanded ? null : step.id)}
                  disabled={step.isLocked}
                  className="w-full flex items-center gap-4 p-4 text-left disabled:cursor-not-allowed"
                >
                  <div className="shrink-0">
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : step.isLocked ? (
                      <Lock className="w-5 h-5 text-neutral-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-neutral-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-neutral-500">Step {step.order}</span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[step.difficulty]}`}
                      >
                        {step.difficulty.charAt(0) + step.difficulty.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <h3 className={`font-semibold ${step.isLocked ? "text-neutral-600" : "text-white"}`}>
                      {step.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="w-3.5 h-3.5" />
                      {step.estimatedMinutes}m
                    </span>
                    {!step.isLocked && (
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </div>
                </button>

                {isExpanded && !step.isLocked && (
                  <div className="px-4 pb-4 pl-14 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-neutral-400">{step.description}</p>

                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                        Learning Objectives
                      </p>
                      <ul className="space-y-1">
                        {step.learningObjectives.map((obj, i) => (
                          <li key={i} className="text-sm text-neutral-300 flex gap-2">
                            <span className="text-neutral-600">•</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {step.skillsGained.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {step.interviewRelevance && (
                      <p className="text-xs text-neutral-500 italic border-l-2 border-neutral-800 pl-3">
                        {step.interviewRelevance}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/notes/${step.id}`)}>
                        Read Notes
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/quiz/${step.id}`)}>
                        Take Quiz
                      </Button>
                      {!step.isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(step.id)}
                          disabled={completingId === step.id}
                        >
                          {completingId === step.id ? "Marking complete..." : "Mark as Complete"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

