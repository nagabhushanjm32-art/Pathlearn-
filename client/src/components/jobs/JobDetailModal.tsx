import React from "react"
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Check,
  ArrowRight,
  Layers,
  Award,
  Bookmark,
  BookmarkCheck,
  Flame,
  Users,
  Calendar,
  Send,
} from "lucide-react"
import { JobOpening } from "../../types/job"
import { Button } from "@/components/ui/button"

interface JobDetailModalProps {
  job: JobOpening | null
  isOpen: boolean
  onClose: () => void
  onApply: (job: JobOpening) => void
  onToggleSave: (job: JobOpening) => void
  onOpenPitchModal?: (job: JobOpening) => void
  isSaved?: boolean
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onToggleSave,
  onOpenPitchModal,
  isSaved = false,
}) => {
  if (!isOpen || !job) return null

  const matchColor =
    (job.matchScore || 0) >= 90
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/25"
      : (job.matchScore || 0) >= 80
      ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/25"
      : "text-amber-500 bg-amber-500/10 border-amber-500/25"

  const handleApplyOfficial = () => {
    // Open official company application portal
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer")
    }
    // Track in PathLearn
    onApply(job)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-6 py-5 border-b border-border/70 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-muted/90 border border-border/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs p-2">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{job.company}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                {job.jobType === "Internship" ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    🎓 Internship
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    💼 Full-Time Job
                  </span>
                )}
                {(job.location.includes("Bangalore") || job.location.includes("Karnataka")) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    📍 Bangalore, KA
                  </span>
                )}
                {job.applyUrl && (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1 font-semibold ml-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight mt-0.5">
                {job.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(job)}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
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

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Direct Application Banner */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Original Verified Company Application
              </span>
              <p className="text-[11px] text-muted-foreground">
                Clicking Apply will redirect directly to the official {job.company} careers requisition page.
              </p>
            </div>

            <Button
              onClick={handleApplyOfficial}
              className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md shadow-indigo-600/20 gap-1.5"
            >
              <span>Apply on {job.company} Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/60">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Location & Mode
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                {job.jobType === "Internship" ? "Intern Monthly Stipend" : "Annual CTC / Package"}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{job.salary}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Domain / Field
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{job.category}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Application Cycle
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{job.deadline}</span>
              </div>
            </div>
          </div>

          {/* AI Match Score Card */}
          {job.matchScore && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${matchColor}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    PathLearn AI Profile Match:{" "}
                    <span className="text-indigo-500">{job.matchScore}% Match</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Your skills and learning roadmap closely match the requirements for this position.
                  </p>
                </div>
              </div>

              {onOpenPitchModal && (
                <Button
                  onClick={() => onOpenPitchModal(job)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-4 text-xs font-semibold shrink-0 cursor-pointer gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Prepare AI Pitch</span>
                </Button>
              )}
            </div>
          )}

          {/* Applied Status Banner if already applied */}
          {job.hasApplied && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-500">
                    Application Tracked • Status: {job.applicationStatus || "Applied"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Application ID: {job.applicationId || "PL-INT-2026-ACTIVE"}
                  </p>
                </div>
              </div>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:underline inline-flex items-center gap-1"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Role Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
              About the Internship Program
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
              What You'll Do as an Intern
            </h4>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements & Qualifications */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
              Minimum Qualifications & Education
            </h4>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nice to Have */}
          {job.niceToHave && job.niceToHave.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
                Preferred Qualifications
              </h4>
              <ul className="space-y-2">
                {job.niceToHave.map((bonus, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{bonus}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Tech Stack */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
              Relevant Technical Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-muted/60 text-foreground border border-border/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Benefits & Compensation */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
                Intern Perks, Housing & Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {job.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-2.5 text-xs text-muted-foreground"
                  >
                    <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-border/70 bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-4 h-4 text-muted-foreground/70" />
            <span>{job.applicantsCount} student applicants</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>

            <Button
              onClick={handleApplyOfficial}
              className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 text-xs shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <span>Apply on {job.company} Careers</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetailModal
