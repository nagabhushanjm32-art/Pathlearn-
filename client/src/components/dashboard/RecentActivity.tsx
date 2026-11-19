import React from "react"
import { CheckCircle2, MessageSquare, Award, Clock } from "lucide-react"
import { ActivityItem } from "../../types"

interface RecentActivityProps {
  activities: ActivityItem[]
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIconAndColor = (type: ActivityItem["type"], status: ActivityItem["status"]) => {
    switch (type) {
      case "LESSON_COMPLETED":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        }
      case "QUIZ_PASSED":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        }
      case "INTERVIEW_COMPLETED":
        return {
          icon: MessageSquare,
          color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
        }
      case "CERTIFICATE_EARNED":
        return {
          icon: Award,
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
        }
      default:
        return {
          icon: Clock,
          color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
        }
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground tracking-tight">Recent Activity</h2>
        <button
          type="button"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          View all
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {activities.map((act, index) => {
          const { icon: Icon, color } = getIconAndColor(act.type, act.status)
          const isLast = index === activities.length - 1

          return (
            <div key={act.id} className="relative flex items-start gap-3.5 group">
              {/* Connecting line */}
              {!isLast && (
                <span
                  className="absolute left-4 top-8 -bottom-4 w-px bg-border/80 group-hover:bg-indigo-500/30 transition-colors"
                  aria-hidden="true"
                />
              )}

              {/* Status Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs z-10 transition-transform duration-200 group-hover:scale-105 ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Activity Info */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-500 transition-colors">
                    {act.title}
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                    {act.timeAgo}
                  </span>
                </div>
                {act.subtitle && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {act.subtitle}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecentActivity
