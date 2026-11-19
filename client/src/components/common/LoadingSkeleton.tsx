import React from "react"

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`p-6 rounded-2xl bg-card border border-border animate-pulse space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="w-16 h-4 rounded-full bg-muted" />
      </div>
      <div className="w-3/4 h-5 rounded-md bg-muted" />
      <div className="w-full h-3.5 rounded-md bg-muted/60" />
      <div className="w-5/6 h-3.5 rounded-md bg-muted/60" />
      <div className="pt-2 flex justify-between items-center">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="w-24 h-9 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

export const SkeletonStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-card border border-border animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="w-14 h-6 rounded bg-muted" />
            <div className="w-24 h-3.5 rounded bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SkeletonCard
