import React from "react"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  colorClass: string
  bgClass: string
  borderClass?: string
  trend?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass = "border-border/80",
  trend
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`p-5 rounded-2xl bg-card border ${borderClass} shadow-xs relative overflow-hidden transition-all duration-200`}
    >
      <div className="flex items-center gap-4">
        {/* Glowing Icon Container */}
        <div className={`w-12 h-12 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0 shadow-xs`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Value and Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
            {trend && (
              <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
