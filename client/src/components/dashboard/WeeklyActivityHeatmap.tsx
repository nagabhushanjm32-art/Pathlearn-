import React from "react"
import { Calendar, TrendingUp, CheckCircle2, Clock } from "lucide-react"

interface DayActivity {
  day: string
  date: string
  hours: number
  lessons: number
  isToday: boolean
}

export const WeeklyActivityHeatmap: React.FC = () => {
  const days: DayActivity[] = [
    { day: "M", date: "Oct 2", hours: 1.2, lessons: 2, isToday: false },
    { day: "T", date: "Oct 3", hours: 0.8, lessons: 1, isToday: false },
    { day: "W", date: "Oct 4", hours: 1.5, lessons: 3, isToday: false },
    { day: "T", date: "Oct 5", hours: 2.0, lessons: 4, isToday: false },
    { day: "F", date: "Oct 6", hours: 1.4, lessons: 2, isToday: true },
    { day: "S", date: "Oct 7", hours: 0.0, lessons: 0, isToday: false },
    { day: "S", date: "Oct 8", hours: 0.0, lessons: 0, isToday: false },
  ]

  const maxHours = 2.5
  const totalHours = days.reduce((acc, d) => acc + d.hours, 0).toFixed(1)
  const totalLessons = days.reduce((acc, d) => acc + d.lessons, 0)

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Weekly Activity Rhythm</h3>
            <p className="text-[10px] text-muted-foreground">{totalHours} hrs studied • {totalLessons} modules completed</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          +18% vs last week
        </span>
      </div>

      {/* Bar Chart Heatmap */}
      <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
        {days.map((item, idx) => {
          const heightPercent = Math.max(12, Math.round((item.hours / maxHours) * 100))
          const hasActivity = item.hours > 0

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 bg-foreground text-background text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 font-medium">
                {item.date}: {item.hours}h ({item.lessons} lessons)
              </div>

              {/* Bar */}
              <div className="w-full bg-muted/60 rounded-xl h-20 flex items-end p-1">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-lg transition-all duration-300 ${
                    item.isToday
                      ? "bg-linear-to-t from-indigo-600 to-indigo-400 shadow-xs ring-2 ring-indigo-500/30"
                      : hasActivity
                      ? "bg-linear-to-t from-emerald-600 to-emerald-400 opacity-90 group-hover:opacity-100"
                      : "bg-muted-foreground/20"
                  }`}
                />
              </div>

              {/* Day Label */}
              <span
                className={`text-[11px] font-bold ${
                  item.isToday
                    ? "text-indigo-500"
                    : hasActivity
                    ? "text-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {item.day}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer stat chips */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>Avg: <strong className="text-foreground">1.4h / day</strong></span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Target: <strong className="text-foreground">90% Met</strong></span>
        </div>
      </div>
    </div>
  )
}

export default WeeklyActivityHeatmap
