import React, { useState, useEffect, useRef } from "react"
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit3,
  Eye,
  Sliders,
  Award,
  BookOpen,
  Briefcase,
  User,
  GraduationCap,
  Code2,
  Cpu,
  Target,
  Search,
  Check,
  RefreshCw,
  Zap,
  Wand2,
  Layers,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronDown,
  Layout,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "../context/AuthContext"
import { exportResumeToPdf, exportResumeToTxt } from "../lib/resumePdfExporter"
import {
  resumeBuilderService,
  ResumeData,
  ResumeTemplateId,
  EducationItem,
  ProjectItem,
  CertificationItem,
  ExperienceItem,
  AchievementItem,
  LanguageItem,
  JobOptimizationResult,
  AtsAuditResult,
  createDefaultResume,
} from "../services/resumeBuilderService"

export const ResumeBuilderPage: React.FC = () => {
  const { user } = useAuth()

  // State Management
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null)
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "edit" | "preview" | "optimize" | "ats-audit"
  >("dashboard")
  const [activeSection, setActiveSection] = useState<
    | "personal"
    | "summary"
    | "education"
    | "skills"
    | "projects"
    | "certifications"
    | "experience"
    | "achievements"
    | "languages"
  >("personal")

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [copied, setCopied] = useState(false)
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null)

  // Job Description Optimization State
  const [jobDescriptionInput, setJobDescriptionInput] = useState("")
  const [jobOptimization, setJobOptimization] = useState<JobOptimizationResult | null>(null)
  const [atsAudit, setAtsAudit] = useState<AtsAuditResult | null>(null)

  // Modals / Create Resume
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newResumeTitle, setNewResumeTitle] = useState("")
  const [newResumeRole, setNewResumeRole] = useState("Full Stack Software Engineer")

  // Target Career options
  const targetCareers = [
    "Full Stack Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "AI / Machine Learning Engineer",
    "Data Scientist",
    "Data Analyst",
    "Cloud & DevOps Engineer",
    "Cybersecurity Engineer",
    "Student / Fresher",
  ]

  // Load initial resumes
  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    setLoading(true)
    try {
      const list = await resumeBuilderService.getResumes()
      setResumes(list)
      if (list.length > 0 && !activeResume) {
        setActiveResume(list[0])
        setAtsAudit(resumeBuilderService.auditResumeLocally(list[0]))
      }
    } catch (err) {
      console.error("Error loading resumes:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Save
  const handleSave = async (resumeToSave?: ResumeData) => {
    const target = resumeToSave || activeResume
    if (!target) return
    setSaving(true)
    try {
      const result = await resumeBuilderService.saveResume(target)
      setActiveResume(result.resume)
      if (result.atsAudit) setAtsAudit(result.atsAudit)

      // Update list
      setResumes((prev) => {
        const idx = prev.findIndex((r) => r.id === result.resume.id)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = result.resume
          return copy
        }
        return [result.resume, ...prev]
      })
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  // Create New Resume
  const handleCreateNew = () => {
    if (!newResumeTitle.trim()) return
    const newResume = createDefaultResume(newResumeRole)
    newResume.title = newResumeTitle.trim()
    newResume.targetRole = newResumeRole
    if (user?.name) newResume.personalInfo.fullName = user.name
    if (user?.email) newResume.personalInfo.email = user.email

    setResumes((prev) => [newResume, ...prev])
    setActiveResume(newResume)
    setAtsAudit(resumeBuilderService.auditResumeLocally(newResume))
    setShowCreateModal(false)
    setNewResumeTitle("")
    setActiveTab("edit")
    resumeBuilderService.saveResume(newResume)
  }

  // Duplicate Resume
  const handleDuplicate = async (id: string) => {
    const cloned = await resumeBuilderService.duplicateResume(id)
    setResumes((prev) => [cloned, ...prev])
    setActiveResume(cloned)
    setActiveTab("edit")
  }

  // Delete Resume
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return
    await resumeBuilderService.deleteResume(id)
    const updated = resumes.filter((r) => r.id !== id)
    setResumes(updated)
    if (activeResume?.id === id) {
      setActiveResume(updated[0] || null)
    }
  }

  // AI Summary Generator
  const handleGenerateSummary = async () => {
    if (!activeResume) return
    setAiGenerating(true)
    try {
      const allSkills = [
        ...activeResume.technicalSkills.languages,
        ...activeResume.technicalSkills.frameworks,
      ]
      const summary = await resumeBuilderService.generateSummary(
        activeResume.targetRole,
        allSkills,
        activeResume.education[0]?.degree || ""
      )
      const updated = { ...activeResume, summary }
      setActiveResume(updated)
      handleSave(updated)
    } finally {
      setAiGenerating(false)
    }
  }

  // AI Bullet Point Improver
  const handleImproveBullet = async (projIdx: number, bulletIdx: number) => {
    if (!activeResume) return
    const rawBullet = activeResume.projects[projIdx]?.bulletPoints[bulletIdx]
    if (!rawBullet) return

    setAiGenerating(true)
    try {
      const improved = await resumeBuilderService.improveBulletPoint(
        rawBullet,
        activeResume.targetRole
      )
      const updatedProjects = [...activeResume.projects]
      updatedProjects[projIdx].bulletPoints[bulletIdx] = improved
      const updated = { ...activeResume, projects: updatedProjects }
      setActiveResume(updated)
      handleSave(updated)
    } finally {
      setAiGenerating(false)
    }
  }

  // Import Platform Certificates
  const handleImportCertificates = async () => {
    if (!activeResume) return
    try {
      const { certificates } = await resumeBuilderService.importPlatformData()
      const existing = activeResume.certifications || []
      const newItems: CertificationItem[] = certificates.map((c) => ({
        id: `cert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: c.name,
        issuingOrganization: c.issuingOrganization,
        issueDate: c.issueDate,
        credentialUrl: c.credentialUrl,
      }))
      const updated = { ...activeResume, certifications: [...existing, ...newItems] }
      setActiveResume(updated)
      handleSave(updated)
    } catch (err) {
      console.error("Import error:", err)
    }
  }

  // Optimize For Job Description
  const handleOptimizeForJob = async () => {
    if (!activeResume || !jobDescriptionInput.trim()) return
    setLoading(true)
    try {
      const result = await resumeBuilderService.optimizeForJob(
        activeResume,
        jobDescriptionInput.trim()
      )
      setJobOptimization(result)
      setActiveTab("optimize")
    } finally {
      setLoading(false)
    }
  }

  // Run ATS Audit
  const handleRunAtsAudit = async () => {
    if (!activeResume) return
    setLoading(true)
    try {
      const result = await resumeBuilderService.auditResume(activeResume)
      setAtsAudit(result)
      setActiveTab("ats-audit")
    } finally {
      setLoading(false)
    }
  }

  // Direct PDF Download to User's Files
  const handleDownloadPdf = (targetResume?: ResumeData) => {
    const target = targetResume || activeResume
    if (!target) return
    try {
      exportResumeToPdf(target)
      const name = target.personalInfo?.fullName || "Resume"
      setDownloadNotice(`Downloaded "${name}_Resume.pdf" directly to your files! Check your Downloads folder.`)
      setTimeout(() => setDownloadNotice(null), 5000)
    } catch (err) {
      console.error("PDF export error:", err)
      window.print()
    }
  }

  // Direct ATS Plain Text Download to User's Files
  const handleDownloadTxt = (targetResume?: ResumeData) => {
    const target = targetResume || activeResume
    if (!target) return
    try {
      exportResumeToTxt(target)
      const name = target.personalInfo?.fullName || "Resume"
      setDownloadNotice(`Downloaded "${name}_Resume.txt" directly to your files! Check your Downloads folder.`)
      setTimeout(() => setDownloadNotice(null), 5000)
    } catch (err) {
      console.error("TXT export error:", err)
    }
  }

  // Print PDF / Browser Dialog
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 space-y-6">
      {/* Top Banner (Hidden on Print) */}
      <div className="print:hidden relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-950/60 via-indigo-950/40 to-slate-950/60 border border-border/80 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ATS Resume Studio & Career Optimizer</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-emerald-400 font-mono">100% ATS Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Professional ATS Resume Builder
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Create, optimize, and tailor professional ATS-friendly resumes using your real profile, skills, projects, and certifications.
              Includes AI bullet point improver, Job Description matching, and print-ready A4 PDF export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Resume</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Hidden on Print) */}
      <div className="print:hidden flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>My Resumes ({resumes.length})</span>
          </button>

          {activeResume && (
            <>
              <button
                onClick={() => setActiveTab("edit")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "edit"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Resume</span>
              </button>

              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live A4 Preview</span>
              </button>

              <button
                onClick={() => setActiveTab("optimize")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "optimize"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Optimize for Job (JD)</span>
              </button>

              <button
                onClick={() => {
                  if (activeResume) setAtsAudit(resumeBuilderService.auditResumeLocally(activeResume))
                  setActiveTab("ats-audit")
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "ats-audit"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ATS Audit & Score ({activeResume.atsScore || 85}%)</span>
              </button>
            </>
          )}
        </div>

        {activeResume && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => handleDownloadPdf(activeResume)}
              className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer shadow-xs font-semibold"
              title="Download ATS-Friendly PDF directly to your laptop"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadTxt(activeResume)}
              className="text-xs h-8 px-2.5 gap-1.5 rounded-lg cursor-pointer shadow-xs border-border/80 text-muted-foreground hover:text-foreground"
              title="Download ATS Plain Text (.txt) directly to your laptop"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ATS Text</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs h-8 px-2.5 gap-1.5 rounded-lg cursor-pointer shadow-xs border-border/80 text-muted-foreground hover:text-foreground"
              title="Open Browser Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        )}
      </div>

      {/* Download Notification Toast Banner */}
      {downloadNotice && (
        <div className="print:hidden p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DASHBOARD VIEW: MY RESUMES & VERSION MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Create New Card */}
            <div
              onClick={() => setShowCreateModal(true)}
              className="p-6 rounded-3xl border-2 border-dashed border-border/80 hover:border-indigo-500/50 bg-card/40 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Create New Resume Version</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tailored for Software Dev, AI/ML, Data Analyst, or Internships
                </p>
              </div>
            </div>

            {/* Resume Cards */}
            {resumes.map((res) => {
              const completion = res.completionPercentage || resumeBuilderService.calculateCompletion(res)
              const score = res.atsScore || resumeBuilderService.auditResumeLocally(res).overallScore

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-foreground line-clamp-1">{res.title}</h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-indigo-400" />
                          <span>{res.targetRole}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                        {res.templateId}
                      </span>
                    </div>

                    {/* Completion & ATS Gauges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">ATS Score</span>
                        <span className="font-extrabold text-emerald-400 text-sm">{score}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Completion</span>
                        <span className="font-extrabold text-indigo-400 text-sm">{completion}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveResume(res)
                          setActiveTab("edit")
                        }}
                        className="text-xs h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveResume(res)
                          setActiveTab("preview")
                        }}
                        className="text-xs h-7 px-2.5 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        <span>Preview</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadPdf(res)}
                        className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 cursor-pointer"
                        title="Download PDF directly to laptop"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(res.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT RESUME VIEW: STRUCTURED MULTI-SECTION FORM */}
      {/* ========================================================================= */}
      {activeTab === "edit" && activeResume && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Section Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 space-y-2 p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
              Resume Sections
            </div>

            {[
              { id: "personal", label: "1. Personal Info", icon: User },
              { id: "summary", label: "2. Career Summary", icon: Sparkles },
              { id: "education", label: "3. Education", icon: GraduationCap },
              { id: "skills", label: "4. Technical Skills", icon: Code2 },
              { id: "projects", label: "5. Projects & AI Bullets", icon: Cpu },
              { id: "certifications", label: "6. Certifications", icon: Award },
              { id: "experience", label: "7. Experience / Internships", icon: Briefcase },
              { id: "achievements", label: "8. Achievements & Awards", icon: Zap },
              { id: "languages", label: "9. Languages", icon: BookOpen },
            ].map((sec) => {
              const Icon = sec.icon
              const isCurrent = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isCurrent
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </button>
              )
            })}

            {/* Template Selector in Editor */}
            <div className="pt-3 border-t border-border/60 space-y-1.5 px-1">
              <label className="text-[11px] font-bold text-foreground block">Resume Template</label>
              <select
                value={activeResume.templateId}
                onChange={(e) => {
                  const updated = { ...activeResume, templateId: e.target.value as ResumeTemplateId }
                  setActiveResume(updated)
                  handleSave(updated)
                }}
                className="w-full text-xs p-2 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none text-foreground"
              >
                <option value="modern">Modern Clean (ATS)</option>
                <option value="minimal">Minimal Classic</option>
                <option value="professional">Professional Executive</option>
                <option value="technical">Technical / Engineering</option>
                <option value="fresher">Student / Fresher</option>
                <option value="software">Software Developer</option>
                <option value="data-ai">Data & AI Engineer</option>
              </select>
            </div>
          </div>

          {/* Main Edit Form Panel (9 cols) */}
          <div className="lg:col-span-9 space-y-6 p-6 rounded-3xl bg-card border border-border/80 shadow-xs">
            {/* SECTION 1: PERSONAL INFO */}
            {activeSection === "personal" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Personal & Contact Information</span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Standard ATS Contact Header</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Full Name *</label>
                    <input
                      type="text"
                      value={activeResume.personalInfo.fullName}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, fullName: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Professional Title *</label>
                    <input
                      type="text"
                      value={activeResume.personalInfo.professionalTitle}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, professionalTitle: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Email Address *</label>
                    <input
                      type="email"
                      value={activeResume.personalInfo.email}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, email: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Phone Number *</label>
                    <input
                      type="tel"
                      value={activeResume.personalInfo.phone}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, phone: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Location (City, Country) *</label>
                    <input
                      type="text"
                      value={activeResume.personalInfo.location}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, location: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">LinkedIn URL</label>
                    <input
                      type="url"
                      value={activeResume.personalInfo.linkedIn || ""}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, linkedIn: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">GitHub URL</label>
                    <input
                      type="url"
                      value={activeResume.personalInfo.github || ""}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, github: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="https://github.com/username"
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Portfolio / Website</label>
                    <input
                      type="url"
                      value={activeResume.personalInfo.portfolio || ""}
                      onChange={(e) => {
                        const updated = {
                          ...activeResume,
                          personalInfo: { ...activeResume.personalInfo, portfolio: e.target.value },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="https://yourportfolio.dev"
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: CAREER SUMMARY */}
            {activeSection === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Professional Summary / Objective</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      2-3 high-impact sentences highlighting your core engineering skills and problem-solving impact.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={aiGenerating}
                    className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                  >
                    {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    <span>Generate with AI</span>
                  </Button>
                </div>

                <textarea
                  value={activeResume.summary}
                  onChange={(e) => {
                    const updated = { ...activeResume, summary: e.target.value }
                    setActiveResume(updated)
                    handleSave(updated)
                  }}
                  rows={4}
                  className="w-full text-xs p-3.5 rounded-2xl bg-background border border-border focus:border-indigo-500 outline-none leading-relaxed"
                  placeholder="Passionate engineer with experience in..."
                />
              </div>
            )}

            {/* SECTION 3: EDUCATION */}
            {activeSection === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Education</span>
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newEdu: EducationItem = {
                        id: `edu-${Date.now()}`,
                        degree: "Bachelor of Engineering",
                        fieldOfStudy: "Computer Science & Engineering",
                        institution: "University Institute",
                        cgpaOrPercentage: "8.5 CGPA",
                        startYear: "2021",
                        endYear: "2025",
                      }
                      const updated = { ...activeResume, education: [...activeResume.education, newEdu] }
                      setActiveResume(updated)
                      handleSave(updated)
                    }}
                    className="text-xs h-7 px-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Degree</span>
                  </Button>
                </div>

                {activeResume.education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Degree / Course</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updatedEdu = [...activeResume.education]
                            updatedEdu[idx].degree = e.target.value
                            const updated = { ...activeResume, education: updatedEdu }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Specialization / Major</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updatedEdu = [...activeResume.education]
                            updatedEdu[idx].fieldOfStudy = e.target.value
                            const updated = { ...activeResume, education: updatedEdu }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">College / Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updatedEdu = [...activeResume.education]
                            updatedEdu[idx].institution = e.target.value
                            const updated = { ...activeResume, education: updatedEdu }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">CGPA / %</label>
                          <input
                            type="text"
                            value={edu.cgpaOrPercentage}
                            onChange={(e) => {
                              const updatedEdu = [...activeResume.education]
                              updatedEdu[idx].cgpaOrPercentage = e.target.value
                              const updated = { ...activeResume, education: updatedEdu }
                              setActiveResume(updated)
                              handleSave(updated)
                            }}
                            className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Start Year</label>
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => {
                              const updatedEdu = [...activeResume.education]
                              updatedEdu[idx].startYear = e.target.value
                              const updated = { ...activeResume, education: updatedEdu }
                              setActiveResume(updated)
                              handleSave(updated)
                            }}
                            className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground">Grad Year</label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => {
                              const updatedEdu = [...activeResume.education]
                              updatedEdu[idx].endYear = e.target.value
                              const updated = { ...activeResume, education: updatedEdu }
                              setActiveResume(updated)
                              handleSave(updated)
                            }}
                            className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updatedEdu = activeResume.education.filter((_, i) => i !== idx)
                        const updated = { ...activeResume, education: updatedEdu }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Degree</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 4: TECHNICAL & SOFT SKILLS */}
            {activeSection === "skills" && (
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>Technical & Soft Skills</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Enter skills as comma-separated tags under each categorized standard heading.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Programming Languages</label>
                    <input
                      type="text"
                      value={activeResume.technicalSkills.languages.join(", ")}
                      onChange={(e) => {
                        const langs = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        const updated = {
                          ...activeResume,
                          technicalSkills: { ...activeResume.technicalSkills, languages: langs },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="TypeScript, Python, Java, C++, SQL..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Frameworks & Libraries</label>
                    <input
                      type="text"
                      value={activeResume.technicalSkills.frameworks.join(", ")}
                      onChange={(e) => {
                        const fws = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        const updated = {
                          ...activeResume,
                          technicalSkills: { ...activeResume.technicalSkills, frameworks: fws },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="React, Node.js, Express, Next.js, FastAPI, Tailwind CSS..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Databases</label>
                    <input
                      type="text"
                      value={activeResume.technicalSkills.databases.join(", ")}
                      onChange={(e) => {
                        const dbs = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        const updated = {
                          ...activeResume,
                          technicalSkills: { ...activeResume.technicalSkills, databases: dbs },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="PostgreSQL, MongoDB, Redis, MySQL..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Cloud & DevOps Tools</label>
                    <input
                      type="text"
                      value={activeResume.technicalSkills.cloudTechnologies.join(", ")}
                      onChange={(e) => {
                        const clouds = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        const updated = {
                          ...activeResume,
                          technicalSkills: { ...activeResume.technicalSkills, cloudTechnologies: clouds },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="Docker, AWS, Git, GitHub Actions, Linux, Vercel..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">AI / ML Technologies (Optional)</label>
                    <input
                      type="text"
                      value={activeResume.technicalSkills.aiMlTechnologies.join(", ")}
                      onChange={(e) => {
                        const ml = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        const updated = {
                          ...activeResume,
                          technicalSkills: { ...activeResume.technicalSkills, aiMlTechnologies: ml },
                        }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="PyTorch, Hugging Face, LangChain, Vector DBs..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-border/60">
                    <label className="font-bold text-foreground">Soft Skills</label>
                    <input
                      type="text"
                      value={activeResume.softSkills.join(", ")}
                      onChange={(e) => {
                        const soft = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        const updated = { ...activeResume, softSkills: soft }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      placeholder="Problem Solving, Leadership, Teamwork, Communication, Time Management..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: PROJECTS WITH AI BULLET IMPROVER */}
            {activeSection === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>Technical Projects</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Add key technical projects with achievement-oriented bullet points. Use "Improve with AI" to strengthen statements.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newProj: ProjectItem = {
                        id: `proj-${Date.now()}`,
                        title: "New Technical Project",
                        description: "Full-stack web application with real-time updates.",
                        technologies: ["React", "Node.js", "TypeScript"],
                        githubUrl: "",
                        bulletPoints: [
                          "Designed and implemented full-stack web application with responsive UI and REST APIs.",
                          "Integrated PostgreSQL database with optimized queries for sub-50ms data retrieval.",
                        ],
                      }
                      const updated = { ...activeResume, projects: [...activeResume.projects, newProj] }
                      setActiveResume(updated)
                      handleSave(updated)
                    }}
                    className="text-xs h-7 px-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Project</span>
                  </Button>
                </div>

                {activeResume.projects.map((proj, pIdx) => (
                  <div key={proj.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updatedProj = [...activeResume.projects]
                            updatedProj[pIdx].title = e.target.value
                            const updated = { ...activeResume, projects: updatedProj }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies.join(", ")}
                          onChange={(e) => {
                            const techs = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            const updatedProj = [...activeResume.projects]
                            updatedProj[pIdx].technologies = techs
                            const updated = { ...activeResume, projects: updatedProj }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">GitHub URL</label>
                        <input
                          type="url"
                          value={proj.githubUrl || ""}
                          onChange={(e) => {
                            const updatedProj = [...activeResume.projects]
                            updatedProj[pIdx].githubUrl = e.target.value
                            const updated = { ...activeResume, projects: updatedProj }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          placeholder="https://github.com/username/repo"
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground">Live Demo URL</label>
                        <input
                          type="url"
                          value={proj.demoUrl || ""}
                          onChange={(e) => {
                            const updatedProj = [...activeResume.projects]
                            updatedProj[pIdx].demoUrl = e.target.value
                            const updated = { ...activeResume, projects: updatedProj }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          placeholder="https://projectdemo.com"
                          className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                    </div>

                    {/* Bullet Points with AI Improver */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-foreground">Achievement Bullet Points</label>
                        <button
                          onClick={() => {
                            const updatedProj = [...activeResume.projects]
                            updatedProj[pIdx].bulletPoints.push(
                              "Implemented responsive features with clean modular architecture."
                            )
                            const updated = { ...activeResume, projects: updatedProj }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      {proj.bulletPoints.map((bp, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bp}
                            onChange={(e) => {
                              const updatedProj = [...activeResume.projects]
                              updatedProj[pIdx].bulletPoints[bIdx] = e.target.value
                              const updated = { ...activeResume, projects: updatedProj }
                              setActiveResume(updated)
                              handleSave(updated)
                            }}
                            className="w-full text-xs p-2 rounded-xl bg-background border border-border outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImproveBullet(pIdx, bIdx)}
                            disabled={aiGenerating}
                            className="text-[10px] h-7 px-2 shrink-0 gap-1 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                            title="Improve with AI Action Verbs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI Improve</span>
                          </Button>
                          <button
                            onClick={() => {
                              const updatedProj = [...activeResume.projects]
                              updatedProj[pIdx].bulletPoints = updatedProj[pIdx].bulletPoints.filter(
                                (_, i) => i !== bIdx
                              )
                              const updated = { ...activeResume, projects: updatedProj }
                              setActiveResume(updated)
                              handleSave(updated)
                            }}
                            className="p-1 text-muted-foreground hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const updatedProj = activeResume.projects.filter((_, i) => i !== pIdx)
                        const updated = { ...activeResume, projects: updatedProj }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Project</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 6: CERTIFICATIONS */}
            {activeSection === "certifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span>Certifications & Credentials</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Include professional credentials with verified issue dates and certificate URLs.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleImportCertificates}
                      className="text-xs h-7 px-2.5 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Import from PathLearn</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const newCert: CertificationItem = {
                          id: `cert-${Date.now()}`,
                          name: "Professional Cloud Certificate",
                          issuingOrganization: "AWS / Google Cloud",
                          issueDate: "2025",
                          credentialUrl: "https://credential.net/verify",
                        }
                        const updated = { ...activeResume, certifications: [...activeResume.certifications, newCert] }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="text-xs h-7 px-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>

                {activeResume.certifications.map((cert, cIdx) => (
                  <div key={cert.id} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-foreground">Certificate Title</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updatedC = [...activeResume.certifications]
                            updatedC[cIdx].name = e.target.value
                            const updated = { ...activeResume, certifications: updatedC }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuingOrganization}
                          onChange={(e) => {
                            const updatedC = [...activeResume.certifications]
                            updatedC[cIdx].issuingOrganization = e.target.value
                            const updated = { ...activeResume, certifications: updatedC }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground">Year / Date</label>
                        <input
                          type="text"
                          value={cert.issueDate}
                          onChange={(e) => {
                            const updatedC = [...activeResume.certifications]
                            updatedC[cIdx].issueDate = e.target.value
                            const updated = { ...activeResume, certifications: updatedC }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-foreground">Verification URL</label>
                        <input
                          type="url"
                          value={cert.credentialUrl || ""}
                          onChange={(e) => {
                            const updatedC = [...activeResume.certifications]
                            updatedC[cIdx].credentialUrl = e.target.value
                            const updated = { ...activeResume, certifications: updatedC }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updatedC = activeResume.certifications.filter((_, i) => i !== cIdx)
                        const updated = { ...activeResume, certifications: updatedC }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Certificate</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 7: EXPERIENCE */}
            {activeSection === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span>Work Experience & Internships</span>
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newExp: ExperienceItem = {
                        id: `exp-${Date.now()}`,
                        organization: "Tech Company",
                        role: "Software Engineer Intern",
                        duration: "Jun 2024 - Sep 2024",
                        location: "Bangalore, India",
                        responsibilities: [
                          "Built scalable RESTful microservices and optimized API throughput.",
                          "Collaborated in Agile sprints to deliver production-ready features.",
                        ],
                        achievements: [],
                      }
                      const updated = { ...activeResume, experience: [...activeResume.experience, newExp] }
                      setActiveResume(updated)
                      handleSave(updated)
                    }}
                    className="text-xs h-7 px-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Experience</span>
                  </Button>
                </div>

                {activeResume.experience.map((exp, eIdx) => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Company / Organization</label>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => {
                            const updatedE = [...activeResume.experience]
                            updatedE[eIdx].organization = e.target.value
                            const updated = { ...activeResume, experience: updatedE }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updatedE = [...activeResume.experience]
                            updatedE[eIdx].role = e.target.value
                            const updated = { ...activeResume, experience: updatedE }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const updatedE = [...activeResume.experience]
                            updatedE[eIdx].duration = e.target.value
                            const updated = { ...activeResume, experience: updatedE }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Location</label>
                        <input
                          type="text"
                          value={exp.location || ""}
                          onChange={(e) => {
                            const updatedE = [...activeResume.experience]
                            updatedE[eIdx].location = e.target.value
                            const updated = { ...activeResume, experience: updatedE }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updatedE = activeResume.experience.filter((_, i) => i !== eIdx)
                        const updated = { ...activeResume, experience: updatedE }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Experience</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 8: ACHIEVEMENTS */}
            {activeSection === "achievements" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span>Achievements & Hackathons</span>
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newAch: AchievementItem = {
                        id: `ach-${Date.now()}`,
                        title: "1st Place Hackathon Winner",
                        category: "Hackathon",
                        date: "2024",
                        description: "Built an AI-driven disaster response system under 36 hours.",
                      }
                      const updated = { ...activeResume, achievements: [...activeResume.achievements, newAch] }
                      setActiveResume(updated)
                      handleSave(updated)
                    }}
                    className="text-xs h-7 px-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add</span>
                  </Button>
                </div>

                {activeResume.achievements.map((ach, aIdx) => (
                  <div key={ach.id} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Title</label>
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => {
                            const updatedA = [...activeResume.achievements]
                            updatedA[aIdx].title = e.target.value
                            const updated = { ...activeResume, achievements: updatedA }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Category</label>
                        <select
                          value={ach.category}
                          onChange={(e) => {
                            const updatedA = [...activeResume.achievements]
                            updatedA[aIdx].category = e.target.value as any
                            const updated = { ...activeResume, achievements: updatedA }
                            setActiveResume(updated)
                            handleSave(updated)
                          }}
                          className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                        >
                          <option value="Hackathon">Hackathon</option>
                          <option value="Competition">Competition</option>
                          <option value="Academic">Academic</option>
                          <option value="Publication">Publication</option>
                          <option value="Award">Award</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Description</label>
                      <input
                        type="text"
                        value={ach.description}
                        onChange={(e) => {
                          const updatedA = [...activeResume.achievements]
                          updatedA[aIdx].description = e.target.value
                          const updated = { ...activeResume, achievements: updatedA }
                          setActiveResume(updated)
                          handleSave(updated)
                        }}
                        className="w-full p-2 rounded-xl bg-background border border-border outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 9: LANGUAGES */}
            {activeSection === "languages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Languages</span>
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newLang: LanguageItem = {
                        id: `lang-${Date.now()}`,
                        language: "Spanish",
                        proficiency: "Intermediate",
                      }
                      const updated = { ...activeResume, languages: [...activeResume.languages, newLang] }
                      setActiveResume(updated)
                      handleSave(updated)
                    }}
                    className="text-xs h-7 px-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Language</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeResume.languages.map((lang, lIdx) => (
                    <div key={lang.id} className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => {
                          const updatedL = [...activeResume.languages]
                          updatedL[lIdx].language = e.target.value
                          const updated = { ...activeResume, languages: updatedL }
                          setActiveResume(updated)
                          handleSave(updated)
                        }}
                        className="text-xs p-1.5 rounded-lg bg-background border border-border outline-none font-semibold w-28"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => {
                          const updatedL = [...activeResume.languages]
                          updatedL[lIdx].proficiency = e.target.value as any
                          const updated = { ...activeResume, languages: updatedL }
                          setActiveResume(updated)
                          handleSave(updated)
                        }}
                        className="text-xs p-1.5 rounded-lg bg-background border border-border outline-none"
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Professional">Professional</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                      </select>
                      <button
                        onClick={() => {
                          const updatedL = activeResume.languages.filter((_, i) => i !== lIdx)
                          const updated = { ...activeResume, languages: updatedL }
                          setActiveResume(updated)
                          handleSave(updated)
                        }}
                        className="p-1 text-muted-foreground hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE A4 RESUME PREVIEW (REACTIVE & PRINT-READY) */}
      {/* ========================================================================= */}
      {activeTab === "preview" && activeResume && (
        <div className="space-y-4">
          {/* Controls toolbar (Hidden on print) */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Template:</span>
              <select
                value={activeResume.templateId}
                onChange={(e) => {
                  const updated = { ...activeResume, templateId: e.target.value as ResumeTemplateId }
                  setActiveResume(updated)
                  handleSave(updated)
                }}
                className="text-xs p-1.5 px-2.5 rounded-xl bg-background border border-border outline-none font-semibold"
              >
                <option value="modern">Modern Clean</option>
                <option value="minimal">Minimal Classic</option>
                <option value="professional">Professional Executive</option>
                <option value="technical">Technical / Engineering</option>
                <option value="fresher">Student / Fresher</option>
                <option value="software">Software Developer</option>
                <option value="data-ai">Data & AI Engineer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                  className="p-1 rounded-lg hover:bg-background text-muted-foreground cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1.5 font-bold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="p-1 rounded-lg hover:bg-background text-muted-foreground cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownloadPdf(activeResume)}
                  className="text-xs h-8 px-3.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  title="Directly save PDF file to your laptop"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTxt(activeResume)}
                  className="text-xs h-8 px-2.5 gap-1.5 rounded-xl cursor-pointer border-border/80 text-muted-foreground hover:text-foreground"
                  title="Download ATS Plain Text (.txt)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ATS Text</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="text-xs h-8 px-2.5 gap-1.5 rounded-xl cursor-pointer border-border/80 text-muted-foreground hover:text-foreground"
                  title="Open Print Dialog"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Rendered A4 Document Container */}
          <div className="flex justify-center overflow-x-auto py-4 bg-zinc-950/20 rounded-3xl border border-border/60">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
              }}
              className="w-[210mm] min-h-[297mm] bg-white text-zinc-900 shadow-2xl p-10 font-sans text-[12px] leading-normal transition-transform duration-200"
            >
              {/* Modern & Standard ATS Template */}
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b-2 border-zinc-900 pb-3 text-center space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-zinc-950 uppercase font-sans">
                    {activeResume.personalInfo.fullName || "YOUR NAME"}
                  </h1>
                  <p className="text-xs font-bold text-zinc-700 tracking-wide uppercase">
                    {activeResume.personalInfo.professionalTitle || activeResume.targetRole}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-600 font-sans pt-1">
                    {activeResume.personalInfo.email && <span>{activeResume.personalInfo.email}</span>}
                    {activeResume.personalInfo.phone && <span>• {activeResume.personalInfo.phone}</span>}
                    {activeResume.personalInfo.location && <span>• {activeResume.personalInfo.location}</span>}
                    {activeResume.personalInfo.linkedIn && (
                      <span>• {activeResume.personalInfo.linkedIn.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    )}
                    {activeResume.personalInfo.github && (
                      <span>• {activeResume.personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {activeResume.summary && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                      Professional Summary
                    </h2>
                    <p className="text-[11px] text-zinc-800 text-justify leading-relaxed">
                      {activeResume.summary}
                    </p>
                  </div>
                )}

                {/* Education */}
                {activeResume.education?.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                      Education
                    </h2>
                    {activeResume.education.map((edu) => (
                      <div key={edu.id} className="text-[11px]">
                        <div className="flex justify-between font-bold text-zinc-950">
                          <span>{edu.degree} in {edu.fieldOfStudy}</span>
                          <span>{edu.startYear} – {edu.endYear}</span>
                        </div>
                        <div className="flex justify-between text-zinc-700 italic">
                          <span>{edu.institution}</span>
                          {edu.cgpaOrPercentage && <span>Score: {edu.cgpaOrPercentage}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Technical Skills */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                    Technical Skills
                  </h2>
                  <div className="text-[11px] text-zinc-800 space-y-0.5">
                    {activeResume.technicalSkills.languages?.length > 0 && (
                      <div>
                        <strong className="font-bold text-zinc-950">Languages: </strong>
                        <span>{activeResume.technicalSkills.languages.join(", ")}</span>
                      </div>
                    )}
                    {activeResume.technicalSkills.frameworks?.length > 0 && (
                      <div>
                        <strong className="font-bold text-zinc-950">Frameworks & Libraries: </strong>
                        <span>{activeResume.technicalSkills.frameworks.join(", ")}</span>
                      </div>
                    )}
                    {activeResume.technicalSkills.databases?.length > 0 && (
                      <div>
                        <strong className="font-bold text-zinc-950">Databases: </strong>
                        <span>{activeResume.technicalSkills.databases.join(", ")}</span>
                      </div>
                    )}
                    {activeResume.technicalSkills.cloudTechnologies?.length > 0 && (
                      <div>
                        <strong className="font-bold text-zinc-950">Cloud & DevOps: </strong>
                        <span>{activeResume.technicalSkills.cloudTechnologies.join(", ")}</span>
                      </div>
                    )}
                    {activeResume.technicalSkills.aiMlTechnologies?.length > 0 && (
                      <div>
                        <strong className="font-bold text-zinc-950">AI & Machine Learning: </strong>
                        <span>{activeResume.technicalSkills.aiMlTechnologies.join(", ")}</span>
                      </div>
                    )}
                    {activeResume.softSkills?.length > 0 && (
                      <div>
                        <strong className="font-bold text-zinc-950">Soft Skills: </strong>
                        <span>{activeResume.softSkills.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Projects */}
                {activeResume.projects?.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                      Technical Projects
                    </h2>
                    {activeResume.projects.map((proj) => (
                      <div key={proj.id} className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between items-baseline font-bold text-zinc-950">
                          <span>
                            {proj.title}{" "}
                            {proj.technologies?.length > 0 && (
                              <span className="font-normal text-zinc-600 text-[10px]">
                                | {proj.technologies.join(", ")}
                              </span>
                            )}
                          </span>
                          {proj.githubUrl && (
                            <span className="font-mono text-[10px] text-zinc-600">
                              {proj.githubUrl.replace(/^https?:\/\//, "")}
                            </span>
                          )}
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-800">
                          {proj.bulletPoints.map((bp, i) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {activeResume.experience?.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                      Experience & Internships
                    </h2>
                    {activeResume.experience.map((exp) => (
                      <div key={exp.id} className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between font-bold text-zinc-950">
                          <span>{exp.role} – {exp.organization}</span>
                          <span>{exp.duration}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-800">
                          {exp.responsibilities.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {activeResume.certifications?.length > 0 && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                      Certifications
                    </h2>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-800">
                      {activeResume.certifications.map((cert) => (
                        <li key={cert.id}>
                          <strong className="font-semibold text-zinc-950">{cert.name}</strong> – {cert.issuingOrganization} ({cert.issueDate})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievements & Languages */}
                {(activeResume.achievements?.length > 0 || activeResume.languages?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {activeResume.achievements?.length > 0 && (
                      <div className="space-y-1">
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                          Achievements
                        </h2>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-800">
                          {activeResume.achievements.map((ach) => (
                            <li key={ach.id}>
                              <strong>{ach.title}</strong>: {ach.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeResume.languages?.length > 0 && (
                      <div className="space-y-1">
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5">
                          Languages
                        </h2>
                        <p className="text-[11px] text-zinc-800">
                          {activeResume.languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OPTIMIZE RESUME FOR JOB DESCRIPTION (JD) VIEW */}
      {/* ========================================================================= */}
      {activeTab === "optimize" && activeResume && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>Job Description (JD) ATS Optimizer</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste any job posting or requirements to extract matched keywords, discover missing skills, and calculate your ATS match score.
                </p>
              </div>
            </div>

            <textarea
              value={jobDescriptionInput}
              onChange={(e) => setJobDescriptionInput(e.target.value)}
              rows={5}
              placeholder="Paste job description text here (e.g. We are seeking a Full Stack Software Engineer proficient in React, Node.js, TypeScript, PostgreSQL, and Docker...)"
              className="w-full text-xs p-3.5 rounded-2xl bg-background border border-border focus:border-indigo-500 outline-none"
            />

            <Button
              onClick={handleOptimizeForJob}
              disabled={loading || !jobDescriptionInput.trim()}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Analyze & Match with Resume</span>
            </Button>
          </div>

          {/* Job Optimization Result Display */}
          {jobOptimization && (
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Target Role Extracted</span>
                  <h3 className="text-lg font-extrabold text-foreground">{jobOptimization.targetJob}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] font-semibold text-muted-foreground block">ATS Score</span>
                    <span className="text-xl font-black text-emerald-400">{jobOptimization.atsScore}%</span>
                  </div>
                  <div className="p-2.5 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-[10px] font-semibold text-muted-foreground block">Keyword Match</span>
                    <span className="text-xl font-black text-indigo-400">{jobOptimization.keywordMatchPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Skills ({jobOptimization.matchedSkills.length})</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Skills found on your resume matching this Job Description:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {jobOptimization.matchedSkills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Skills ({jobOptimization.missingSkills.length})</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Required skills in JD not currently listed on your resume (Do NOT add if you don't possess them):
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {jobOptimization.missingSkills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground">Actionable Improvement Suggestions</h4>
                <div className="space-y-1.5">
                  {jobOptimization.suggestedImprovements.map((sug, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Tailored Summary */}
              {jobOptimization.tailoredSummaryRecommendation && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Recommended Tailored Summary</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updated = { ...activeResume, summary: jobOptimization.tailoredSummaryRecommendation }
                        setActiveResume(updated)
                        handleSave(updated)
                      }}
                      className="text-xs h-7 px-2 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span>Apply to Resume</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    "{jobOptimization.tailoredSummaryRecommendation}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ATS RESUME AUDIT & QUALITY CHECKER VIEW */}
      {/* ========================================================================= */}
      {activeTab === "ats-audit" && activeResume && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>ATS Resume Compatibility & Quality Audit</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Complete breakdown of parsing readability, keyword density, section headers, and action verbs.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">Overall ATS Score</span>
                <span className="text-2xl font-black text-emerald-400">
                  {atsAudit?.overallScore || activeResume.atsScore || 85}%
                </span>
              </div>
            </div>

            {/* Sub-Score Breakdown Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Formatting & Structure</span>
                <span className="text-lg font-bold text-foreground">{atsAudit?.formattingScore || 98}%</span>
                <span className="text-[9px] text-emerald-400 font-mono block">100% ATS Readable</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Skills & Tech Stack</span>
                <span className="text-lg font-bold text-foreground">{atsAudit?.skillsMatch || 90}%</span>
                <span className="text-[9px] text-indigo-400 font-mono block">Categorized</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Project Impact</span>
                <span className="text-lg font-bold text-foreground">{atsAudit?.projectRelevanceScore || 90}%</span>
                <span className="text-[9px] text-purple-400 font-mono block">Action Verbs</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Contact Header</span>
                <span className="text-lg font-bold text-foreground">{atsAudit?.contactInfoScore || 95}%</span>
                <span className="text-[9px] text-emerald-400 font-mono block">Complete</span>
              </div>
            </div>

            {/* Quality Issues / Checklist */}
            {atsAudit?.qualityIssues && atsAudit.qualityIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground">Detected Quality & Content Warnings</h4>
                <div className="space-y-2">
                  {atsAudit.qualityIssues.map((iss, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                        iss.type === "error"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : iss.type === "warning"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">[{iss.section}] </span>
                        <span>{iss.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Suggestions */}
            {atsAudit?.actionableSuggestions && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground">Actionable Hiring Manager Recommendations</h4>
                <div className="space-y-1.5">
                  {atsAudit.actionableSuggestions.map((sug, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW RESUME */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="space-y-1 border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Create New Resume Version</h3>
              <p className="text-xs text-muted-foreground">
                Set up a tailored resume version targeting a specific technical track.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Resume Title</label>
                <input
                  type="text"
                  value={newResumeTitle}
                  onChange={(e) => setNewResumeTitle(e.target.value)}
                  placeholder="e.g. AI / Machine Learning Resume"
                  className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Target Career Role</label>
                <select
                  value={newResumeRole}
                  onChange={(e) => setNewResumeRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-border outline-none"
                >
                  {targetCareers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateNew}
                disabled={!newResumeTitle.trim()}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer font-bold"
              >
                Create Resume
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeBuilderPage
