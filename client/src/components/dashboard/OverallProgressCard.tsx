import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ProgressRing } from "../common/ProgressRing"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

interface OverallProgressCardProps {
  progress: number
  completedSteps: number
  totalSteps: number
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({
  progress = 0,
  completedSteps = 0,
  totalSteps = 0
}) => {
  const navigate = useNavigate()

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          Your Learning Progress
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </h2>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/60">
          Target: 100%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Animated Circular Progress Ring */}
        <div className="shrink-0">
          <ProgressRing
            progress={progress}
            size={110}
            strokeWidth={10}
            labelClassName="text-xl font-black text-foreground"
            gradientId="hero-progress-ring"
            startColor="#6366f1"
            endColor="#a855f7"
          />
        </div>

        {/* Progress Narrative & Linear Bar */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-foreground">Overall Progress</span>
              <span className="font-medium text-muted-foreground">
                Completed {completedSteps} of {totalSteps} steps
              </span>
            </div>

            {/* Custom Linear Gradient Progress Bar */}
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground">
              {totalSteps > 0 && totalSteps > completedSteps ? (
                <>
                  Keep going! Just <span className="font-semibold text-foreground">{totalSteps - completedSteps} steps</span> left to complete your current tracks.
                </>
              ) : completedSteps > 0 && completedSteps === totalSteps ? (
                "🎉 Incredible achievement! All current roadmap steps are completed."
              ) : (
                "Select any domain track to start completing lessons and quizzes."
              )}
            </p>

            <Button
              onClick={() => navigate("/domains")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-4 py-2 shadow-xs shrink-0 gap-1.5"
            >
              View Domains
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverallProgressCard
