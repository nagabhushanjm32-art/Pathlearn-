import React, { useState, useEffect } from "react"
import { Timer, Play, Pause, RotateCcw, Coffee, Sparkles, Volume2, VolumeX, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"

const MODE_DURATIONS: Record<TimerMode, number> = {
  FOCUS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
}

export const FocusTimerWidget: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>("FOCUS")
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.FOCUS)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    let interval: any = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      if (mode === "FOCUS") {
        setCompletedSessions((prev) => prev + 1)
        setMode("SHORT_BREAK")
        setTimeLeft(MODE_DURATIONS.SHORT_BREAK)
      } else {
        setMode("FOCUS")
        setTimeLeft(MODE_DURATIONS.FOCUS)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode])

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(MODE_DURATIONS[newMode])
    setIsRunning(false)
  }

  const toggleRun = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(MODE_DURATIONS[mode])
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const totalDuration = MODE_DURATIONS[mode]
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100)

  return (
    <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden space-y-4">
      {/* Ambient background blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Deep Focus Pomodoro</h3>
            <p className="text-[10px] text-muted-foreground">{completedSessions} focus session{completedSessions !== 1 ? "s" : ""} done today 🍅</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title={isMuted ? "Unmute chimes" : "Mute chimes"}
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/60 relative z-10">
        <button
          onClick={() => switchMode("FOCUS")}
          className={`py-1 text-[11px] font-semibold rounded-lg transition-all ${
            mode === "FOCUS"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => switchMode("SHORT_BREAK")}
          className={`py-1 text-[11px] font-semibold rounded-lg transition-all ${
            mode === "SHORT_BREAK"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          5m Break
        </button>
        <button
          onClick={() => switchMode("LONG_BREAK")}
          className={`py-1 text-[11px] font-semibold rounded-lg transition-all ${
            mode === "LONG_BREAK"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          15m Break
        </button>
      </div>

      {/* Big Digital Clock Display */}
      <div className="flex flex-col items-center justify-center py-2 relative z-10">
        <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground flex items-center gap-1">
          <span>{formattedTime}</span>
        </div>
        <span className="text-[11px] text-muted-foreground mt-1 font-medium">
          {mode === "FOCUS" ? "🔥 Stay locked in on your current module" : "☕ Take a breath & stretch"}
        </span>

        {/* Linear progress */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 pt-1 relative z-10">
        <Button
          onClick={toggleRun}
          className={`flex-1 rounded-xl text-xs font-semibold py-2 shadow-xs gap-1.5 ${
            isRunning
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Session</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Focus</span>
            </>
          )}
        </Button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default FocusTimerWidget
