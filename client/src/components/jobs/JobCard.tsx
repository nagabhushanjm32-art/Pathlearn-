import React from "react"
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Flame,
  ArrowRight,
  Send,
  Building2,
  Layers,
  Check,
  ExternalLink,
  GraduationCap,
  Globe,
} from "lucide-react"
import { JobOpening } from "../../types/job"
import { Button } from "@/components/ui/button"

interface JobCardProps {
  job: JobOpening
  onViewDetails: (job: JobOpening) => void
  onApply: (job: JobOpening) => void
  onToggleSave: (job: JobOpening) => void
  isSaved?: boolean
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewDetails,
  onApply,
  onToggleSave,
  isSaved = false,
}) => {
  const matchColor =
    (job.matchScore || 0) >= 90
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/25"
      : (job.matchScore || 0) >= 80
      ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/25"
      : "text-amber-500 bg-amber-500/10 border-amber-500/25"

  const handleApplyDirect = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Open original verified official company application link in a new tab
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer")
    }
    // Record application in PathLearn tracker
    onApply(job)
  }

  const isInternship = job.jobType === "Internship"
  const isBangaloreOrKA =
    job.location.toLowerCase().includes("bangalore") ||
    job.location.toLowerCase().includes("karnataka") ||
    job.location.toLowerCase().includes("mysore")

  return (
    <div className="group rounded-3xl bg-card border border-border/80 hover:border-indigo-500/40 p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between relative overflow-hidden">
      {/* Top Background Gradient Highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header: Company & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-muted/90 border border-border/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs p-2">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = "none"
                  }}
                />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground truncate">
                  {job.company}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />

                {/* Source Platform Badge (LinkedIn, Naukri, Indeed, Internshala, etc.) */}
                {job.sourcePlatform && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      job.sourcePlatform === "LinkedIn"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                        : job.sourcePlatform === "Naukri"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                        : job.sourcePlatform === "Indeed"
                        ? "bg-blue-600/10 text-blue-400 border-blue-600/25"
                        : job.sourcePlatform === "Internshala"
                        ? "bg-teal-500/10 text-teal-400 border-teal-500/25"
                        : job.sourcePlatform === "Wellfound"
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/25"
                        : job.sourcePlatform === "Monster/Foundit"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                    }`}
                  >
                    <Globe className="w-2.5 h-2.5" />
                    <span>{job.sourcePlatform}</span>
                  </span>
                )}

                {/* Company Type Badge (Startup, AI, Scaleup, Services, Enterprise) */}
                {job.companyType && (
                  <span
                    className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      job.companyType === "Startup"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        : job.companyType === "AI Startup"
                        ? "bg-violet-500/10 text-violet-400 border-violet-500/25"
                        : job.companyType === "Product Scaleup"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : job.companyType === "Tech Services"
                        ? "bg-slate-500/10 text-slate-300 border-slate-500/25"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/25"
                    }`}
                  >
                    {job.companyType}
                  </span>
                )}

                {/* Role Type Badge: Job vs Internship */}
                {isInternship ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <GraduationCap className="w-2.5 h-2.5" /> Internship
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Briefcase className="w-2.5 h-2.5" /> Full-Time Job
                  </span>
                )}

                {/* Bangalore / Karnataka Hub Badge */}
                {isBangaloreOrKA && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <MapPin className="w-2.5 h-2.5" /> Bangalore, KA
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Hiring
                </span>
              </div>
              <h3
                onClick={() => onViewDetails(job)}
                className="text-base sm:text-lg font-bold text-foreground group-hover:text-indigo-500 transition-colors cursor-pointer truncate mt-0.5"
                title={job.title}
              >
                {job.title}
              </h3>
            </div>
          </div>

          {/* Bookmark & Match Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {job.matchScore && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border ${matchColor}`}
              >
                <Sparkles className="w-3 h-3" />
                {job.matchScore}% Match
              </span>
            )}
            <button
              onClick={() => onToggleSave(job)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved || job.isSaved
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                  : "bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={isSaved || job.isSaved ? "Saved Job" : "Save Job"}
            >
              {isSaved || job.isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-indigo-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Match badge */}
        {job.matchScore && (
          <div className="sm:hidden mb-3">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${matchColor}`}
            >
              <Sparkles className="w-3 h-3" />
              {job.matchScore}% Match with your Skills
            </span>
          </div>
        )}

        {/* Meta Chips Grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/60">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/60">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-indigo-500">{job.jobType}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/60">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-foreground truncate">{job.salary}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/60">
            <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>{job.category}</span>
          </div>
        </div>

        {/* Brief Description */}
        <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Tech Stack Skills Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {job.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-indigo-500/5 text-foreground/80 border border-border/70 hover:border-indigo-500/30 transition-colors"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5">
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3.5 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>{job.postedAt}</span>
          <span>•</span>
          <span className="text-foreground/70">{job.applicantsCount} applied</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(job)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            Details
          </button>

          {job.hasApplied ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>Applied</span>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:underline ml-1"
                title="Open original job link"
              >
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
          ) : (
            <Button
              onClick={handleApplyDirect}
              size="sm"
              className="rounded-xl px-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 font-bold gap-1.5 text-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              title={`Opens official ${job.company} careers portal`}
            >
              <span>Apply</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobCard
