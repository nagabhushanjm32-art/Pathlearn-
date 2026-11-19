import React from "react"
import { Link } from "react-router-dom"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  linkTo?: string
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showTagline = false,
  linkTo = "/dashboard",
  className = ""
}) => {
  const iconSizes = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  const logoContent = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Modern 'P' Icon in Gradient Box */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 shrink-0 relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/8 h-5/8 text-white drop-shadow"
        >
          {/* Stylized P path */}
          <path d="M7 4h7a4 4 0 0 1 0 8H7v8" />
          <circle cx="14" cy="8" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-bold tracking-tight text-foreground ${textSizes[size]}`}>
            Path<span className="text-indigo-500 dark:text-indigo-400">Learn</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 mb-2 animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-muted-foreground tracking-tight -mt-0.5">
            Learn smarter. Build skills.
          </span>
        )}
      </div>
    </div>
  )

  if (linkTo) {
    return <Link to={linkTo} className="inline-block transition-transform hover:scale-[1.01]">{logoContent}</Link>
  }

  return logoContent
}

export default Logo
