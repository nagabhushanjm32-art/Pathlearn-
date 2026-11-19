import React, { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Sparkles, Volume2, VolumeX, Radio, Cpu } from "lucide-react"
import { InterviewState } from "../../types"

interface AiInterviewerAvatarProps {
  state: InterviewState
  domainName: string
  currentQuestionText?: string
  autoSpeak?: boolean
  onQuestionFinishedSpeaking?: () => void
}

export const AiInterviewerAvatar: React.FC<AiInterviewerAvatarProps> = ({
  state,
  domainName,
  currentQuestionText,
  autoSpeak = true,
  onQuestionFinishedSpeaking,
}) => {
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const safetyTimerRef = useRef<any>(null)
  const hasFinishedRef = useRef<boolean>(false)

  const finishSpeaking = useCallback(() => {
    if (hasFinishedRef.current) return
    hasFinishedRef.current = true
    clearTimeout(safetyTimerRef.current)

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // ignore
      }
    }

    setIsSpeakingVoice(false)
    if (onQuestionFinishedSpeaking) {
      onQuestionFinishedSpeaking()
    }
  }, [onQuestionFinishedSpeaking])

  // Web Speech Synthesis for realistic AI interviewer voice
  useEffect(() => {
    if (!currentQuestionText || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    if (state === "ASKING" || state === "READY") {
      hasFinishedRef.current = false
      clearTimeout(safetyTimerRef.current)

      if (!speechEnabled) {
        // Voice is muted: auto transition to listening after brief pause
        const timer = setTimeout(() => {
          finishSpeaking()
        }, 1200)
        return () => clearTimeout(timer)
      }

      try {
        window.speechSynthesis.cancel() // Cancel previous

        const utterance = new SpeechSynthesisUtterance(currentQuestionText)
        utteranceRef.current = utterance
        ;(window as any).__activeSpeechUtterance = utterance // Prevent V8 garbage collection

        utterance.rate = 1.05
        utterance.pitch = 1.0

        // Select professional voice if available
        const voices = window.speechSynthesis.getVoices()
        const englishVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("Samantha") ||
                v.name.includes("Alex"))
          ) || voices.find((v) => v.lang.startsWith("en"))

        if (englishVoice) {
          utterance.voice = englishVoice
        }

        utterance.onstart = () => {
          setIsSpeakingVoice(true)
        }

        utterance.onend = () => {
          finishSpeaking()
        }

        utterance.onerror = () => {
          finishSpeaking()
        }

        // Safety fallback timer: calculate duration based on word count
        const wordCount = currentQuestionText.trim().split(/\s+/).length
        const estimatedDurationMs = Math.max(3000, Math.min(22000, (wordCount / 2.2) * 1000 + 1200))

        safetyTimerRef.current = setTimeout(() => {
          if (!hasFinishedRef.current) {
            finishSpeaking()
          }
        }, estimatedDurationMs)

        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.warn("Speech synthesis notice:", err)
        finishSpeaking()
      }
    } else {
      clearTimeout(safetyTimerRef.current)
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {
          // ignore
        }
      }
      setIsSpeakingVoice(false)
    }

    return () => {
      clearTimeout(safetyTimerRef.current)
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {
          // ignore
        }
      }
    }
  }, [currentQuestionText, state, speechEnabled, finishSpeaking])

  const toggleSpeech = () => {
    if (speechEnabled) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {
          // ignore
        }
      }
      setIsSpeakingVoice(false)
    }
    setSpeechEnabled(!speechEnabled)
  }

  // Visual label & colors depending on state
  const getStateMeta = () => {
    switch (state) {
      case "ASKING":
        return {
          label: "Presenting Question",
          color: "text-indigo-400",
          badgeBg: "bg-indigo-500/10 border-indigo-500/30",
          dotColor: "bg-indigo-400",
          glowColor: "rgba(99, 102, 241, 0.4)",
        }
      case "LISTENING":
        return {
          label: "Listening to Answer...",
          color: "text-emerald-400",
          badgeBg: "bg-emerald-500/10 border-emerald-500/30",
          dotColor: "bg-emerald-400 animate-ping",
          glowColor: "rgba(16, 185, 129, 0.4)",
        }
      case "ANALYZING":
      case "NEXT_QUESTION":
        return {
          label: "Analyzing & Adapting...",
          color: "text-purple-400",
          badgeBg: "bg-purple-500/10 border-purple-500/30",
          dotColor: "bg-purple-400 animate-pulse",
          glowColor: "rgba(168, 85, 247, 0.45)",
        }
      case "COMPLETING":
        return {
          label: "Synthesizing Evaluation...",
          color: "text-amber-400",
          badgeBg: "bg-amber-500/10 border-amber-500/30",
          dotColor: "bg-amber-400",
          glowColor: "rgba(245, 158, 11, 0.4)",
        }
      case "ANSWER_REVIEW":
        return {
          label: "Awaiting Candidate Review",
          color: "text-blue-400",
          badgeBg: "bg-blue-500/10 border-blue-500/30",
          dotColor: "bg-blue-400",
          glowColor: "rgba(59, 130, 246, 0.3)",
        }
      default:
        return {
          label: "PathLearn AI Interviewer",
          color: "text-indigo-400",
          badgeBg: "bg-indigo-500/10 border-indigo-500/20",
          dotColor: "bg-indigo-400",
          glowColor: "rgba(99, 102, 241, 0.25)",
        }
    }
  }

  const meta = getStateMeta()

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-card/90 dark:bg-card/70 border border-border/80 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col items-center text-center select-none group">
      {/* Dynamic Ambient Background Aura */}
      <motion.div
        animate={{
          scale: state === "ASKING" || isSpeakingVoice ? [1, 1.25, 1] : state === "LISTENING" ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: state === "ANALYZING" ? [0.3, 0.6, 0.3] : [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-72 h-72 rounded-full pointer-events-none blur-3xl"
        style={{
          background: meta.glowColor,
        }}
      />

      {/* Top Header: Voice Toggle + Domain Badge */}
      <div className="w-full flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {domainName} Track
          </span>
        </div>

        <button
          type="button"
          onClick={toggleSpeech}
          title={speechEnabled ? "Mute AI Voice" : "Enable AI Voice"}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            speechEnabled
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20"
              : "bg-muted text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="text-[10px] hidden sm:inline">{speechEnabled ? "Voice ON" : "Voice Muted"}</span>
        </button>
      </div>

      {/* Futuristic AI Avatar Orb Stage */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Outer Orbital Rings */}
        <motion.div
          animate={{
            rotate: 360,
            scale: state === "ASKING" || isSpeakingVoice ? [1, 1.08, 1] : 1,
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute w-44 h-44 rounded-full border border-dashed border-indigo-500/30"
        />

        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-36 h-36 rounded-full border border-indigo-400/20"
        />

        {/* Pulsing Audio Ripples when speaking */}
        <AnimatePresence>
          {(state === "ASKING" || isSpeakingVoice || state === "LISTENING") && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className={`absolute w-32 h-32 rounded-full border ${
                  state === "LISTENING" ? "border-emerald-500/50" : "border-indigo-500/50"
                }`}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.7, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6, ease: "easeOut" }}
                className={`absolute w-32 h-32 rounded-full border ${
                  state === "LISTENING" ? "border-emerald-400/30" : "border-purple-500/30"
                }`}
              />
            </>
          )}
        </AnimatePresence>

        {/* Central Core Robot / Neural Sphere */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-28 h-28 rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 p-1 flex items-center justify-center shadow-2xl z-10 overflow-hidden"
        >
          {/* Inner holographic grid line */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px]" />

          {/* Core Face Indicator */}
          <div className="relative flex flex-col items-center justify-center space-y-2">
            {/* Robot Eyes */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scaleY: state === "ANALYZING" ? [1, 0.2, 1] : 1,
                  backgroundColor:
                    state === "LISTENING"
                      ? "#10b981"
                      : state === "ANALYZING"
                      ? "#c084fc"
                      : "#818cf8",
                }}
                transition={{ duration: 0.2, repeat: state === "ANALYZING" ? Infinity : 0, repeatDelay: 2 }}
                className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_rgba(129,140,248,0.8)]"
              />
              <motion.div
                animate={{
                  scaleY: state === "ANALYZING" ? [1, 0.2, 1] : 1,
                  backgroundColor:
                    state === "LISTENING"
                      ? "#10b981"
                      : state === "ANALYZING"
                      ? "#c084fc"
                      : "#818cf8",
                }}
                transition={{ duration: 0.2, repeat: state === "ANALYZING" ? Infinity : 0, repeatDelay: 2 }}
                className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_rgba(129,140,248,0.8)]"
              />
            </div>

            {/* Robot Mouth / Speech Wave */}
            <div className="flex items-center gap-1 h-3">
              {[0.4, 1, 0.7, 1.2, 0.5].map((scale, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height:
                      state === "ASKING" || isSpeakingVoice
                        ? [3, 14 * scale, 3]
                        : state === "LISTENING"
                        ? [2, 8 * scale, 2]
                        : 2,
                  }}
                  transition={{
                    duration: 0.4 + i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`w-1 rounded-full ${
                    state === "LISTENING"
                      ? "bg-emerald-400"
                      : state === "ANALYZING"
                      ? "bg-purple-400"
                      : "bg-indigo-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* State Status Pill */}
      <div className="z-10 mt-2 flex flex-col items-center gap-2">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${meta.badgeBg} ${meta.color} shadow-xs transition-all`}
        >
          <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
          <span>{meta.label}</span>
        </div>

        {(state === "ASKING" || isSpeakingVoice) && (
          <button
            type="button"
            onClick={finishSpeaking}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 transition-all cursor-pointer shadow-xs"
            title="Click to stop robot voice and immediately activate microphone"
          >
            <span>⚡ Ready? Skip Robot & Speak Answer Now</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default AiInterviewerAvatar
