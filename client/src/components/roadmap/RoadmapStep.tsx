import React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Play, FileText, HelpCircle, Check, Lock, Clock, Sparkles } from "lucide-react"
import { RoadmapStep as RoadmapStepType } from "../../types"
import { motion } from "framer-motion"

interface RoadmapStepProps {
  step: RoadmapStepType
  index: number
  domainSlug: string
  onToggleComplete?: (stepId: string, completed: boolean) => void
}

export const RoadmapStep: React.FC<RoadmapStepProps> = ({
  step,
  index,
  domainSlug: _domainSlug,
  onToggleComplete
}) => {
  const navigate = useNavigate()
  const stepNumber = String(step.order || index + 1).padStart(2, "0")

  // Determine actual state
  const isLocked = step.isLocked && !step.isCompleted
  const isCompleted = step.isCompleted
  const videoProgress = step.videoProgress || 0
  const isInProgress = !isLocked && !isCompleted && (videoProgress > 0 || step.isCurrent)
  const isNotStarted = !isLocked && !isCompleted && videoProgress === 0 && !step.isCurrent

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border relative ${
        isCompleted
          ? "bg-card border-emerald-500/30 hover:border-emerald-500/50 shadow-xs"
          : isInProgress
          ? "bg-card border-indigo-500/60 ring-1 ring-indigo-500/20 shadow-sm"
          : isLocked
          ? "bg-muted/30 border-border/50 opacity-70"
          : "bg-card/80 border-border/70 hover:border-indigo-500/30"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        {/* Left: Step Number, Thumbnail, and Details */}
        <div className="flex items-start gap-4 flex-1">
          {/* Step Number Badge */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
              isCompleted
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : isInProgress
                ? "bg-indigo-600 text-white shadow-indigo-500/20"
                : isLocked
                ? "bg-muted text-muted-foreground border border-border/60"
                : "bg-muted/80 text-foreground border border-border/60"
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4 text-muted-foreground" /> : stepNumber}
          </div>

          {/* Video Thumbnail */}
          {step.thumbnailUrl && (
            <div
              className={`hidden md:block w-20 h-16 rounded-xl overflow-hidden shrink-0 border relative group ${
                isLocked ? "border-border/40 cursor-not-allowed opacity-60" : "border-border/70 cursor-pointer"
              }`}
              onClick={() => !isLocked && navigate(`/learn/${step.id}`)}
            >
              <img
                src={step.thumbnailUrl}
                alt={step.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {!isLocked && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              )}
            </div>
          )}

          {/* Title, Meta, and Description */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm sm:text-base font-bold tracking-tight ${
                  isLocked ? "text-muted-foreground" : "text-foreground cursor-pointer hover:text-indigo-500"
                }`}
                onClick={() => !isLocked && navigate(`/learn/${step.id}`)}
              >
                {step.title}
              </h4>

              {/* Real Status Badge */}
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              ) : isInProgress ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" />
                  In Progress ({videoProgress > 0 ? `${videoProgress}%` : "Started"})
                </span>
              ) : isLocked ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/60">
                  <Lock className="w-2.5 h-2.5" />
                  Locked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Not Started
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {step.description}
            </p>

            {/* Time & Difficulty */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
              <span className="font-semibold text-foreground/80">{step.difficulty}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {step.estimatedMinutes} min
              </span>
            </div>

            {/* Video Progress Bar if started */}
            {isInProgress && videoProgress > 0 && (
              <div className="pt-1.5 space-y-1 max-w-xs">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Video Progress</span>
                  <span className="text-indigo-400">{videoProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Mark Complete Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
          {/* Action Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              disabled={isLocked}
              onClick={() => navigate(`/learn/${step.id}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                isLocked
                  ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/40"
                  : isInProgress || isNotStarted
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-muted/80 hover:bg-muted text-foreground border border-border/60"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isCompleted ? "Review Lesson" : videoProgress > 0 ? "Continue Video" : "Watch Video"}</span>
            </button>

            <button
              disabled={isLocked}
              onClick={() => navigate(`/learn/${step.id}`)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-muted/80 hover:bg-muted text-foreground border border-border/60 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="AI Notes"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">AI Notes</span>
            </button>

            <button
              disabled={isLocked}
              onClick={() => navigate(`/learn/${step.id}`)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-muted/80 hover:bg-muted text-foreground border border-border/60 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Quiz"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Quiz</span>
            </button>
          </div>

          {/* Completion Checkbox Button */}
          <button
            disabled={isLocked}
            onClick={() => onToggleComplete?.(step.id, !step.isCompleted)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 border ${
              isCompleted
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : isLocked
                ? "bg-muted/30 text-transparent border-border/40 cursor-not-allowed"
                : "bg-muted/60 text-transparent hover:text-muted-foreground border-border hover:border-emerald-500"
            }`}
            title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default RoadmapStep
