import React from "react"
import { AlertTriangle, LogOut, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface EndInterviewModalProps {
  isOpen: boolean
  answeredCount: number
  minRequired?: number
  onClose: () => void
  onConfirmEnd: () => void
  isSubmitting?: boolean
}

export const EndInterviewModal: React.FC<EndInterviewModalProps> = ({
  isOpen,
  answeredCount,
  minRequired = 5,
  onClose,
  onConfirmEnd,
  isSubmitting = false,
}) => {
  if (!isOpen) return null

  const hasMetMin = answeredCount >= minRequired

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-2xl z-10 space-y-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              End Interview Early?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hasMetMin ? (
                <>
                  You have completed <strong className="text-foreground">{answeredCount} questions</strong>. Your current interview will be submitted for final multi-dimensional AI scoring and report generation.
                </>
              ) : (
                <>
                  You have answered <strong className="text-foreground">{answeredCount} questions</strong> (minimum recommended is {minRequired}). Ending now will evaluate only the responses provided so far.
                </>
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between font-medium">
              <span>Questions Answered</span>
              <span className="font-bold text-foreground">{answeredCount}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Certificate Eligibility</span>
              <span className={hasMetMin ? "text-emerald-500 font-bold" : "text-amber-500 font-semibold"}>
                {hasMetMin ? "Eligible (score ≥60%)" : "May be incomplete"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl text-xs font-semibold border-border"
            >
              Continue Interview
            </Button>

            <Button
              type="button"
              onClick={onConfirmEnd}
              disabled={isSubmitting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Evaluating..." : "End & Evaluate"}</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EndInterviewModal
