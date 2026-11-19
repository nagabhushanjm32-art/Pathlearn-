import React, { useState, useEffect } from "react"
import { Flame, CheckCircle2, Circle, Sparkles, Trophy, Zap, Gift } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface DailyGoalItem {
  id: string
  title: string
  category: string
  completed: boolean
  points: number
}

interface DailyStreakTrackerProps {
  initialStreak?: number
  completedLessons?: number
  passedQuizzes?: number
}

const STORAGE_KEY = "pathlearn_daily_streak_state"

export const DailyStreakTracker: React.FC<DailyStreakTrackerProps> = ({
  initialStreak = 3,
  completedLessons = 0,
  passedQuizzes = 0,
}) => {
  const todayStr = new Date().toISOString().split("T")[0]

  const [streak, setStreak] = useState(initialStreak)
  const [hasClaimedToday, setHasClaimedToday] = useState(false)
  const [totalXp, setTotalXp] = useState(180)
  const [showCelebration, setShowCelebration] = useState(false)

  const [goals, setGoals] = useState<DailyGoalItem[]>([
    {
      id: "goal-1",
      title: "Watch 1 video lesson",
      category: "Learning",
      completed: completedLessons > 0,
      points: 25,
    },
    {
      id: "goal-2",
      title: "Pass a step quiz (≥60%)",
      category: "Practice",
      completed: passedQuizzes > 0,
      points: 35,
    },
    {
      id: "goal-3",
      title: "Try daily AI challenge or mock drill",
      category: "AI Prep",
      completed: false,
      points: 40,
    },
  ])

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.lastDate === todayStr) {
          setHasClaimedToday(parsed.hasClaimedToday ?? false)
          setStreak(parsed.streak ?? initialStreak)
          setTotalXp(parsed.totalXp ?? 180)
          if (parsed.goals) {
            setGoals(parsed.goals)
          }
        }
      }
    } catch {
      // fallback
    }
  }, [todayStr, initialStreak])

  // Save to local storage
  const saveState = (updatedStreak: number, updatedClaimed: boolean, updatedXp: number, updatedGoals: DailyGoalItem[]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lastDate: todayStr,
          streak: updatedStreak,
          hasClaimedToday: updatedClaimed,
          totalXp: updatedXp,
          goals: updatedGoals,
        })
      )
    } catch {
      // silent
    }
  }

  const toggleGoal = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextState = !g.completed
        const deltaXp = nextState ? g.points : -g.points
        const newXp = Math.max(0, totalXp + deltaXp)
        setTotalXp(newXp)
        return { ...g, completed: nextState }
      }
      return g
    })
    setGoals(updated)
    saveState(streak, hasClaimedToday, totalXp, updated)
  }

  const handleClaimStreak = () => {
    if (hasClaimedToday) return
    const nextStreak = streak + 1
    const nextXp = totalXp + 50
    setStreak(nextStreak)
    setTotalXp(nextXp)
    setHasClaimedToday(true)
    setShowCelebration(true)
    saveState(nextStreak, true, nextXp, goals)

    setTimeout(() => {
      setShowCelebration(false)
    }, 4000)
  }

  const completedCount = goals.filter((g) => g.completed).length
  const progressPercent = Math.round((completedCount / goals.length) * 100)

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden space-y-5">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Streak badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xs">
            <Flame className="w-6 h-6 fill-amber-500 animate-bounce duration-1000" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                {streak}-Day Streak
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                Active 🔥
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Keep studying daily to maintain your multiplier</p>
          </div>
        </div>

        {/* XP Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-bold font-mono">
          <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
          <span>{totalXp} XP</span>
        </div>
      </div>

      {/* Daily Goals Progress Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <span>Daily Goals</span>
            <span className="text-muted-foreground font-normal">
              ({completedCount}/{goals.length} completed)
            </span>
          </span>
          <span className="font-bold text-indigo-500">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-linear-to-r from-amber-500 via-indigo-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      {/* Goal Items Checklist */}
      <div className="space-y-2 relative z-10">
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer group ${
              goal.completed
                ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                : "bg-muted/30 hover:bg-muted/60 border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {goal.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground shrink-0" />
              )}
              <span className={`text-xs font-medium ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {goal.title}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 shrink-0">
              +{goal.points} XP
            </span>
          </div>
        ))}
      </div>

      {/* Claim Streak Action Button */}
      <div className="pt-1 relative z-10">
        <Button
          onClick={handleClaimStreak}
          disabled={hasClaimedToday}
          className={`w-full rounded-xl text-xs font-semibold py-2.5 shadow-xs gap-2 transition-all ${
            hasClaimedToday
              ? "bg-muted text-muted-foreground border border-border cursor-default hover:bg-muted"
              : "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20"
          }`}
        >
          {hasClaimedToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Today's Streak Claimed (+50 XP)</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 animate-bounce" />
              <span>Claim Today's Streak Bonus (+50 XP)</span>
            </>
          )}
        </Button>
      </div>

      {/* Celebration Popup Toast */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="p-3 rounded-2xl bg-amber-500 text-amber-950 font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>🎉 Streak updated to {streak} days! +50 XP bonus added.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DailyStreakTracker
