import React from "react"
import { motion } from "framer-motion"

interface ProgressRingProps {
  progress: number // 0 to 100
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  labelClassName?: string
  gradientId?: string
  startColor?: string
  endColor?: string
  trackColor?: string
  className?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 72,
  strokeWidth = 6,
  showLabel = true,
  labelClassName = "text-sm font-bold text-foreground",
  gradientId = "progress-grad-default",
  startColor = "#6366f1",
  endColor = "#a855f7",
  trackColor,
  className = ""
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || "currentColor"}
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/40 dark:text-muted/20"
        />

        {/* Animated Progress Stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={labelClassName}>{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  )
}

export default ProgressRing
