import React, { useState, useEffect } from "react"
import { EyeOff, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export const TabFocusDetector: React.FC = () => {
  const [isTabHidden, setIsTabHidden] = useState(false)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true)
      } else {
        setIsTabHidden(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (!isTabHidden) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      >
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border text-center space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
            <EyeOff className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">
              Interview Paused
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please return to the interview window to resume your session and continue your response.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              Focus window to continue
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TabFocusDetector
