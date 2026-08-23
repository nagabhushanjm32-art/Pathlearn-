import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { Button } from "@/components/ui/button"
import {
  Brain,
  BarChart3,
  Database,
  Code2,
  Globe,
  ShieldCheck,
  Cloud,
  Sprout,
  TrendingUp,
  Rocket,
  BookOpen,
  Target,
  Hammer,
  Briefcase,
  Timer,
  Clock,
  Clock3,
  Flame,
  type LucideIcon,
} from "lucide-react"

const CAREER_OPTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "AI/ML Engineer", icon: Brain },
  { label: "Data Analyst", icon: BarChart3 },
  { label: "Data Scientist", icon: Database },
  { label: "Software Developer", icon: Code2 },
  { label: "Web Developer", icon: Globe },
  { label: "Cybersecurity Analyst", icon: ShieldCheck },
  { label: "Cloud Engineer", icon: Cloud },
]

const LEVEL_OPTIONS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Beginner", value: "BEGINNER", icon: Sprout },
  { label: "Intermediate", value: "INTERMEDIATE", icon: TrendingUp },
  { label: "Advanced", value: "ADVANCED", icon: Rocket },
]

const GOAL_OPTIONS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Learn fundamentals", value: "LEARN_FUNDAMENTALS", icon: BookOpen },
  { label: "Prepare for interviews", value: "INTERVIEW_PREP", icon: Target },
  { label: "Build projects", value: "BUILD_PROJECTS", icon: Hammer },
  { label: "Become job-ready", value: "JOB_READY", icon: Briefcase },
]

const STUDY_TIME_OPTIONS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "30 minutes/day", value: "THIRTY_MIN", icon: Timer },
  { label: "1 hour/day", value: "ONE_HOUR", icon: Clock },
  { label: "2 hours/day", value: "TWO_HOURS", icon: Clock3 },
  { label: "3+ hours/day", value: "THREE_PLUS_HOURS", icon: Flame },
]

const STEP_TITLES = [
  "What do you want to become?",
  "What is your current level?",
  "What is your target?",
  "How much time can you study?",
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [targetRole, setTargetRole] = useState("")
  const [level, setLevel] = useState("")
  const [goal, setGoal] = useState("")
  const [studyTimePerDay, setStudyTimePerDay] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleFinish() {
    setError("")
    setLoading(true)
    try {
      await api.patch("/profile/onboarding", { targetRole, level, goal, studyTimePerDay })
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function OptionButton({
    label,
    icon: Icon,
    selected,
    onClick,
  }: {
    label: string
    icon: LucideIcon
    selected: boolean
    onClick: () => void
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-150 ${
          selected
            ? "border-white bg-white text-black font-semibold shadow-[0_0_0_3px_rgba(255,255,255,0.15)]"
            : "border-neutral-700 bg-neutral-900 text-white hover:border-neutral-500 hover:bg-neutral-800"
        }`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${selected ? "text-black" : "text-neutral-400"}`} />
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Step {step} of 4
            </span>
          </div>
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  s <= step ? "bg-white" : "bg-neutral-800"
                }`}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mb-6 leading-snug">
            {STEP_TITLES[step - 1]}
          </h2>

          <div key={step} className="space-y-2.5 animate-in fade-in slide-in-from-right-4 duration-300">
            {step === 1 &&
              CAREER_OPTIONS.map((option) => (
                <OptionButton
                  key={option.label}
                  label={option.label}
                  icon={option.icon}
                  selected={targetRole === option.label}
                  onClick={() => setTargetRole(option.label)}
                />
              ))}

            {step === 2 &&
              LEVEL_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={level === option.value}
                  onClick={() => setLevel(option.value)}
                />
              ))}

            {step === 3 &&
              GOAL_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={goal === option.value}
                  onClick={() => setGoal(option.value)}
                />
              ))}

            {step === 4 &&
              STUDY_TIME_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={studyTimePerDay === option.value}
                  onClick={() => setStudyTimePerDay(option.value)}
                />
              ))}
          </div>

          {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}

            {step < 4 && (
              <Button
                type="button"
                className="flex-1"
                disabled={
                  (step === 1 && !targetRole) ||
                  (step === 2 && !level) ||
                  (step === 3 && !goal)
                }
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            )}

            {step === 4 && (
              <Button
                type="button"
                className="flex-1"
                disabled={!studyTimePerDay || loading}
                onClick={handleFinish}
              >
                {loading ? "Saving..." : "Finish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
