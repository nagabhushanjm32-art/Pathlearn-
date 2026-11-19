import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Code,
  BarChart3,
  Brain,
  Globe,
  Sparkles,
  Database,
  ArrowRight,
  Clock,
  Layers
} from "lucide-react"
import { Domain } from "../../types"
import { ProgressRing } from "../common/ProgressRing"
import { motion } from "framer-motion"

interface DomainCardProps {
  domain: Domain
  featured?: boolean
}

export const DomainCard: React.FC<DomainCardProps> = ({ domain, featured = false }) => {
  const navigate = useNavigate()

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case "code":
        return <Code className="w-5 h-5 text-blue-500" />
      case "bar-chart-3":
        return <BarChart3 className="w-5 h-5 text-cyan-500" />
      case "brain":
        return <Brain className="w-5 h-5 text-purple-500" />
      case "globe":
        return <Globe className="w-5 h-5 text-emerald-500" />
      case "sparkles":
        return <Sparkles className="w-5 h-5 text-pink-500" />
      case "database":
        return <Database className="w-5 h-5 text-amber-500" />
      default:
        return <Layers className="w-5 h-5 text-indigo-500" />
    }
  }

  const isStarted = domain.progress > 0

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl bg-card border border-border/80 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 relative group ${
        featured ? "ring-1 ring-indigo-500/30" : ""
      }`}
    >
      <div>
        {/* Top Icon & Progress */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-muted/80 dark:bg-muted/40 border border-border/60 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {getDomainIcon(domain.icon)}
          </div>

          <ProgressRing
            progress={domain.progress}
            size={52}
            strokeWidth={4.5}
            labelClassName="text-xs font-bold text-foreground"
            gradientId={`domain-ring-${domain.id}`}
            startColor="#6366f1"
            endColor="#a855f7"
          />
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-indigo-500 transition-colors">
          {domain.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {domain.description}
        </p>

        {/* Meta Info: Difficulty & Steps */}
        <div className="flex items-center gap-3 mt-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {domain.estimatedDays} days
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {domain.completedSteps}/{domain.totalSteps} steps
          </span>
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {domain.skillTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border/40"
            >
              {tag}
            </span>
          ))}
          {domain.skillTags.length > 3 && (
            <span className="text-[10px] font-medium text-muted-foreground/80 px-1 py-0.5">
              +{domain.skillTags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <button
          onClick={() => navigate(`/domains/${domain.slug}`)}
          className={`w-full py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            isStarted
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              : "bg-muted/80 hover:bg-muted text-foreground border border-border/70"
          }`}
        >
          <span>{isStarted ? "Continue Learning" : "Start Learning"}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  )
}

export default DomainCard
