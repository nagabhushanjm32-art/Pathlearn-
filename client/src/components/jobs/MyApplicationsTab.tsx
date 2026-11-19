import React from "react"
import {
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Briefcase,
} from "lucide-react"
import { JobApplication, JobOpening } from "../../types/job"
import { Button } from "@/components/ui/button"

interface MyApplicationsTabProps {
  applications: JobApplication[]
  onViewJob: (jobId: string) => void
  onBrowseJobs: () => void
}

export const MyApplicationsTab: React.FC<MyApplicationsTabProps> = ({
  applications,
  onViewJob,
  onBrowseJobs,
}) => {
  if (applications.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 rounded-3xl bg-muted/20 border border-border/80 p-8">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto shadow-sm">
          <Briefcase className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No applications submitted yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Explore active openings from leading tech companies and fast-track your applications using your PathLearn ATS resume.
          </p>
        </div>
        <Button
          onClick={onBrowseJobs}
          className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-md shadow-indigo-600/20"
        >
          Explore Latest Openings
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        )
      case "SHORTLISTED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/25">
            <Sparkles className="w-3 h-3" /> Shortlisted
          </span>
        )
      case "INTERVIEW_SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/25">
            <Calendar className="w-3 h-3" /> Interview Scheduled
          </span>
        )
      case "OFFER_EXTENDED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3" /> Offer Extended
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
            <CheckCircle2 className="w-3 h-3" /> Applied
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 hover:border-indigo-500/30 transition-all shadow-xs space-y-4"
        >
          {/* Top row: Role, Company, Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/80 border border-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                {app.companyLogo ? (
                  <img src={app.companyLogo} alt={app.company} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{app.company}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] text-muted-foreground/60">•</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{app.id}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{app.jobTitle}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {getStatusBadge(app.status)}
              {app.applyUrl && (
                <a
                  href={app.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                >
                  <span>Open Company Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewJob(app.jobId)}
                className="rounded-xl text-xs font-semibold gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Hiring Pipeline Visualizer */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 block">1. Applied</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-amber-500 block">2. In Review</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground block">3. Interview</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground block">4. Decision</span>
              </div>
            </div>
          </div>

          {/* Application Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground block">Attached Resume</span>
                <span className="font-semibold text-foreground truncate block">{app.resumeName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground block">Applied On</span>
                <span className="font-semibold text-foreground">
                  {new Date(app.appliedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground block">Profile Match Score</span>
                <span className="font-semibold text-foreground">{app.matchScore}% Match</span>
              </div>
            </div>
          </div>

          {/* Status Notes / Next Steps */}
          {app.statusNotes && (
            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{app.statusNotes}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MyApplicationsTab
