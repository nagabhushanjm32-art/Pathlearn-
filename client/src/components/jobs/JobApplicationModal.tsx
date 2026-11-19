import React, { useState } from "react"
import {
  X,
  Building2,
  FileText,
  Sparkles,
  Check,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Upload,
  Globe,
  Link2,
  Code2,
  Phone,
  Mail,
  User,
  ArrowRight,
  PartyPopper,
  CheckCircle2,
  Calendar,
  Copy,
} from "lucide-react"
import { JobOpening, JobApplication } from "../../types/job"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jobService } from "../../services/jobService"

interface JobApplicationModalProps {
  job: JobOpening | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (application: JobApplication) => void
  userName?: string
  userEmail?: string
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
  userName = "Candidate",
  userEmail = "candidate@pathlearn.edu",
}) => {
  if (!isOpen || !job) return null

  // Form State
  const [candidateName, setCandidateName] = useState(userName)
  const [candidateEmail, setCandidateEmail] = useState(userEmail)
  const [candidatePhone, setCandidatePhone] = useState("+1 (555) 019-2834")
  const [portfolioUrl, setPortfolioUrl] = useState("https://punith.dev")
  const [linkedInUrl, setLinkedInUrl] = useState("https://linkedin.com/in/punithkr")
  const [githubUrl, setGithubUrl] = useState("https://github.com/punithkr")
  const [experienceYears, setExperienceYears] = useState("Student / 2026 Graduate")
  const [noticePeriod, setNoticePeriod] = useState("Summer 2026")

  // Resume selector
  const [resumeType, setResumeType] = useState<"pathlearn-builder" | "uploaded" | "custom">(
    "pathlearn-builder"
  )
  const [resumeName, setResumeName] = useState("PathLearn ATS Master Resume (Computer Science & AI)")

  // Cover Pitch
  const [coverPitch, setCoverPitch] = useState(
    `I am excited to apply for the ${job.title} at ${job.company}. My coursework and technical projects in software engineering align with your team's mission.`
  )
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false)
  const [pitchCopied, setPitchCopied] = useState(false)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedApplication, setSubmittedApplication] = useState<JobApplication | null>(null)

  // Generate AI Pitch
  const handleGenerateAiPitch = async () => {
    setIsGeneratingPitch(true)
    try {
      const pitch = await jobService.generateCoverPitch({
        jobId: job.id,
        name: candidateName,
        experience: experienceYears,
        skills: job.tags,
        targetRole: job.title,
      })
      if (pitch) {
        setCoverPitch(pitch)
      }
    } catch (err: any) {
      console.error("AI pitch generation failed:", err)
    } finally {
      setIsGeneratingPitch(false)
    }
  }

  // Copy Pitch
  const handleCopyPitch = () => {
    navigator.clipboard.writeText(coverPitch)
    setPitchCopied(true)
    setTimeout(() => setPitchCopied(false), 2500)
  }

  // Handle Form Submit & Redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const application = await jobService.applyForJob(job.id, {
        candidateName,
        candidateEmail,
        candidatePhone,
        portfolioUrl,
        linkedInUrl,
        githubUrl,
        experienceYears,
        noticePeriod,
        resumeType,
        resumeName,
        coverPitch,
      })

      setSubmittedApplication(application)
      onSuccess(application)

      // Open official company application portal
      if (job.applyUrl) {
        window.open(job.applyUrl, "_blank", "noopener,noreferrer")
      }
    } catch (err: any) {
      console.error("Application tracking failed:", err)
      setSubmitError(err.response?.data?.message || err.message || "Failed to record application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success Celebration View
  if (submittedApplication) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Application Redirected & Tracked
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight pt-2">
              Official Portal Opened! 🚀
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              We opened the official <span className="text-foreground font-semibold">{job.company}</span> careers page for{" "}
              <span className="text-foreground font-semibold">{job.title}</span>. Your application status is also saved in PathLearn.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">PathLearn Tracker ID</span>
              <span className="font-mono font-bold text-indigo-500">{submittedApplication.id}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Company Portal</span>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-500 hover:underline flex items-center gap-1"
              >
                <span>{job.company} Careers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Attached Resume</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {submittedApplication.resumeName}
              </span>
            </div>
          </div>

          {/* Quick Copy Cover Pitch for pasting on company portal */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400">
                AI Cover Pitch (Ready to paste on company portal)
              </span>
              <button
                type="button"
                onClick={handleCopyPitch}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                {pitchCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{pitchCopied ? "Copied!" : "Copy Pitch"}</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
              {coverPitch}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (job.applyUrl) window.open(job.applyUrl, "_blank", "noopener,noreferrer")
              }}
              variant="outline"
              className="flex-1 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <span>Re-open {job.company} Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Done & Return
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/70 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-muted/90 border border-border/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs p-2">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">
                Apply to {job.company}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate max-w-md">
                {job.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {submitError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Official Link Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <ExternalLink className="w-4 h-4 text-indigo-500" />
              <span>Redirects directly to official {job.company} Careers portal</span>
            </div>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-indigo-400 underline font-semibold"
            >
              Preview Link
            </a>
          </div>

          {/* Candidate Info Grid */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Candidate Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="pl-9 rounded-xl text-xs"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="pl-9 rounded-xl text-xs"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="tel"
                    required
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    className="pl-9 rounded-xl text-xs"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Graduation / Status</label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-border text-foreground focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Undergraduate Student (Class of 2026/2027)">Undergraduate Student (Class of 2026/2027)</option>
                  <option value="Master's / Graduate Student">Master's / Graduate Student</option>
                  <option value="PhD Candidate / Researcher">PhD Candidate / Researcher</option>
                  <option value="Recent Graduate (0-1 year experience)">Recent Graduate (0-1 year experience)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Online Profiles */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Portfolio & Profiles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                  placeholder="Portfolio URL"
                />
              </div>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                  placeholder="LinkedIn Profile"
                />
              </div>
              <div className="relative">
                <Code2 className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                  placeholder="GitHub Profile"
                />
              </div>
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Resume for Application
              </h4>
              <span className="text-[11px] text-indigo-500 font-semibold">
                ATS Compatibility 100%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => {
                  setResumeType("pathlearn-builder")
                  setResumeName("PathLearn ATS Master Resume (Computer Science & AI)")
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  resumeType === "pathlearn-builder"
                    ? "bg-indigo-500/10 border-indigo-500/50 shadow-xs ring-1 ring-indigo-500/30"
                    : "bg-muted/30 border-border/70 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>PathLearn ATS Resume</span>
                  </div>
                  {resumeType === "pathlearn-builder" && (
                    <Check className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Synchronized with ATS Resume Builder Studio
                </p>
              </div>

              <div
                onClick={() => {
                  setResumeType("uploaded")
                  setResumeName("Technical_Student_Resume.pdf")
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  resumeType === "uploaded"
                    ? "bg-indigo-500/10 border-indigo-500/50 shadow-xs ring-1 ring-indigo-500/30"
                    : "bg-muted/30 border-border/70 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>Uploaded Profile Resume</span>
                  </div>
                  {resumeType === "uploaded" && (
                    <Check className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Parsed in AI Career Profile
                </p>
              </div>
            </div>
          </div>

          {/* Cover Pitch & AI Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Tailored Cover Note / Statement
              </label>
              <button
                type="button"
                onClick={handleGenerateAiPitch}
                disabled={isGeneratingPitch}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPitch ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Crafting Pitch with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>✨ AI Generate Pitch with Gemini</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              required
              value={coverPitch}
              onChange={(e) => setCoverPitch(e.target.value)}
              className="w-full p-3.5 rounded-2xl text-xs bg-muted/30 border border-border text-foreground focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
              placeholder="Why are you eager to join this internship?"
            />
          </div>

          {/* Term / Cohort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Internship Term / Availability
              </label>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-border text-foreground focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Summer 2026 (May - Aug)">Summer 2026 (May - Aug)</option>
                <option value="Fall 2025/2026 (Sep - Dec)">Fall 2025/2026 (Sep - Dec)</option>
                <option value="Winter 2026 (Jan - Apr)">Winter 2026 (Jan - Apr)</option>
                <option value="Immediate / Year-Round Co-op">Immediate / Year-Round Co-op</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground w-full">
                🔒 You will be redirected to complete final submission on {job.company}'s official careers portal.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-border/70 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 text-xs shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Apply on {job.company} Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobApplicationModal
