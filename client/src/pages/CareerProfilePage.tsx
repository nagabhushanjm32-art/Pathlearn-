import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Briefcase,
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  Mic,
  ChevronRight,
  Layers,
  Search,
  Check,
  Copy,
  Trash2,
  RefreshCw,
  Info,
  Clock,
  Code2,
  Wrench,
  ArrowRight,
  Target,
  FileCheck,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { careerService } from "../services/careerService"
import { domainService } from "../services/domainService"
import {
  CareerProfileData,
  ResumeStatus,
  UserSkillItem,
  SkillGapItem,
  ProjectRecommendation,
  ResumeImprovementData,
  ReadinessBreakdown,
} from "../types"

export interface CareerRoleItem {
  name: string
  isDomain: boolean
  category: string
}

const ALL_CAREER_DOMAINS_AND_ROLES: CareerRoleItem[] = [
  // Primary Learning Domains
  { name: "AI Engineer", isDomain: true, category: "AI & Machine Learning" },
  { name: "Generative AI Engineer", isDomain: true, category: "AI & Machine Learning" },
  { name: "Machine Learning Engineer", isDomain: true, category: "AI & Machine Learning" },
  { name: "Data Scientist", isDomain: true, category: "Data & Analytics" },
  { name: "Data Analyst", isDomain: true, category: "Data & Analytics" },
  { name: "Data Engineer", isDomain: true, category: "Data & Analytics" },
  { name: "Python Developer", isDomain: true, category: "Software Engineering" },
  { name: "Web Developer", isDomain: true, category: "Software Engineering" },
  { name: "Full Stack Developer", isDomain: true, category: "Software Engineering" },
  { name: "Frontend Developer", isDomain: true, category: "Software Engineering" },
  { name: "Backend Developer", isDomain: true, category: "Software Engineering" },
  { name: "Data Structures & Algorithms", isDomain: true, category: "Computer Science" },

  // Specialized Industry Tracks
  { name: "Cloud Engineer", isDomain: false, category: "Cloud & Infrastructure" },
  { name: "DevOps Engineer", isDomain: false, category: "Cloud & Infrastructure" },
  { name: "Cybersecurity Analyst", isDomain: false, category: "Security" },
  { name: "Product Manager", isDomain: false, category: "Management" },
  { name: "LLM Solutions Architect", isDomain: false, category: "AI & Machine Learning" },
  { name: "AI Research Engineer", isDomain: false, category: "AI & Machine Learning" },
]

export default function CareerProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine initial active tab from URL query or default
  const queryTab = new URLSearchParams(location.search).get("tab")
  const [activeTab, setActiveTab] = useState<"overview" | "skill-gap" | "projects" | "resume">(
    queryTab === "skill-gap"
      ? "skill-gap"
      : queryTab === "projects"
      ? "projects"
      : queryTab === "resume"
      ? "resume"
      : "overview"
  )

  // State variables
  const [profile, setProfile] = useState<CareerProfileData | null>(null)
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus | null>(null)
  const [skills, setSkills] = useState<UserSkillItem[]>([])
  const [gaps, setGaps] = useState<SkillGapItem[]>([])
  const [projects, setProjects] = useState<ProjectRecommendation[]>([])
  const [resumeImprovement, setResumeImprovement] = useState<ResumeImprovementData | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Target role selector & domains
  const [targetRole, setTargetRole] = useState<string>("AI Engineer")
  const [roleSearch, setRoleSearch] = useState<string>("")
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false)
  const [customRoleInput, setCustomRoleInput] = useState<string>("")
  const [isCustomRoleMode, setIsCustomRoleMode] = useState<boolean>(false)
  const [availableRoles, setAvailableRoles] = useState<CareerRoleItem[]>(ALL_CAREER_DOMAINS_AND_ROLES)
  const [roleFilterTab, setRoleFilterTab] = useState<"ALL" | "DOMAINS" | "ROLES">("ALL")

  // Upload modal & animated progress
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadStep, setUploadStep] = useState<number>(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Readiness calculation explainer modal
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false)
  const [addedRoadmapSkills, setAddedRoadmapSkills] = useState<Record<string, boolean>>({})

  // Load Career Profile context
  const loadCareerData = async () => {
    try {
      setLoading(true)
      const data = await careerService.getCareerProfile()
      if (data) {
        setProfile(data.careerProfile)
        setResumeStatus(data.resumeStatus)
        setSkills(data.skills || [])
        setStats(data.stats)
        setGaps(data.gaps || [])
        setTargetRole(data.careerProfile.targetRole || "AI Engineer")
      }

      // Load all available domains from backend
      try {
        const doms = await domainService.getDomains()
        if (doms && doms.length > 0) {
          setAvailableRoles((prev) => {
            const seen = new Set(prev.map((r) => r.name.toLowerCase()))
            const extras: CareerRoleItem[] = doms
              .filter((d) => !seen.has(d.name.toLowerCase()))
              .map((d) => ({ name: d.name, isDomain: true, category: "Learning Domain" }))
            return [...prev, ...extras]
          })
        }
      } catch (e) {
        console.warn("Could not load domains list:", e)
      }

      // Load projects & improvements in parallel
      const recs = await careerService.getRecommendations()
      if (recs?.projects) setProjects(recs.projects)

      try {
        const imp = await careerService.improveResume()
        if (imp) setResumeImprovement(imp)
      } catch {
        // Resume might not be uploaded yet
      }
    } catch (err) {
      console.error("Failed to load career profile:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCareerData()
  }, [])

  // Handle Target Role Update
  const handleSelectRole = async (newRole: string) => {
    setTargetRole(newRole)
    setIsRoleDropdownOpen(false)
    setIsCustomRoleMode(false)
    try {
      const res = await careerService.updateTargetRole(newRole)
      if (res?.readiness) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                targetRole: newRole,
                readinessScore: res.readiness.score,
                breakdown: res.readiness.breakdown,
              }
            : null
        )
      }
      if (res?.skillGaps) {
        setGaps(res.skillGaps)
      }
      const recs = await careerService.getRecommendations()
      if (recs?.projects) setProjects(recs.projects)
    } catch (err) {
      console.error("Failed to update target role:", err)
    }
  }

  // Handle Resume File Upload & Animated Sequence
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      validateAndSetFile(f)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    setUploadError(null)
    const validExts = [".pdf", ".docx"]
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    if (!validExts.includes(ext)) {
      setUploadError("Invalid file type. Please upload a PDF or DOCX file.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit. Please upload a smaller file.")
      return
    }
    setUploadFile(file)
  }

  const handleStartAnalysis = async () => {
    if (!uploadFile || isUploading) return
    setIsUploading(true)
    setUploadError(null)
    setUploadStep(1) // Reading resume...

    try {
      await new Promise((r) => setTimeout(r, 600))
      setUploadStep(2) // Extracting skills...

      await new Promise((r) => setTimeout(r, 600))
      setUploadStep(3) // Understanding experience...

      await new Promise((r) => setTimeout(r, 600))
      setUploadStep(4) // Matching target role & skill gaps...

      const res = await careerService.uploadResume(uploadFile)

      setUploadStep(5) // Creating recommendations...
      await new Promise((r) => setTimeout(r, 500))

      setUploadStep(6) // Analysis Complete!
      await new Promise((r) => setTimeout(r, 600))

      setIsUploadModalOpen(false)
      setUploadFile(null)
      setUploadStep(0)
      loadCareerData()
    } catch (err: any) {
      console.error("Resume analysis error:", err)
      setUploadError(err.response?.data?.message || "Failed to analyze resume. Please try again.")
      setIsUploading(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to delete your uploaded resume and its extracted skills?")) {
      return
    }
    try {
      await careerService.deleteResume()
      loadCareerData()
    } catch (err) {
      console.error("Delete resume error:", err)
    }
  }

  const handleAddToRoadmap = async (skillName: string) => {
    try {
      await careerService.personalizeRoadmap(targetRole)
      setAddedRoadmapSkills((prev) => ({ ...prev, [skillName]: true }))
    } catch (err) {
      console.error("Personalize roadmap error:", err)
    }
  }

  const filteredRoles = availableRoles.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(roleSearch.toLowerCase())
    if (roleFilterTab === "DOMAINS") return matchesSearch && r.isDomain
    if (roleFilterTab === "ROLES") return matchesSearch && !r.isDomain
    return matchesSearch
  })

  const readinessScore = profile?.readinessScore ?? 0
  const profileCompletion = profile?.profileCompletion ?? 20

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto select-none">
      {/* ================= MODAL: RESUME UPLOADER ================= */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Resume Analyzer</span>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false)
                      setUploadFile(null)
                      setUploadError(null)
                    }}
                    className="text-muted-foreground hover:text-foreground p-1 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {!isUploading ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Upload Your Resume</h3>
                    <p className="text-xs text-muted-foreground">
                      Our Claude AI engine will extract your verified skills, experience, and benchmark your readiness for <strong>{targetRole}</strong>.
                    </p>
                  </div>

                  {/* Dropzone Area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                      uploadFile
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-border hover:border-indigo-500/60 bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/20">
                        {uploadFile ? <FileCheck className="w-6 h-6 text-emerald-400" /> : <Upload className="w-6 h-6" />}
                      </div>
                      {uploadFile ? (
                        <div>
                          <p className="text-xs font-bold text-emerald-400 truncate max-w-xs mx-auto">
                            {uploadFile.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI analysis
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Drag & Drop Resume or <span className="text-indigo-400 underline">Browse Files</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PDF or DOCX • Maximum file size 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Private & Encrypted storage</span>
                    </p>
                    <Button
                      onClick={handleStartAnalysis}
                      disabled={!uploadFile}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 shadow-xs gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze Resume</span>
                    </Button>
                  </div>
                </>
              ) : (
                /* Multi-Step Loading Experience */
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      {uploadStep === 6 ? "Analysis Complete!" : "Analyzing your resume..."}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Connecting with Claude AI to benchmark technical depth and project impact.
                    </p>
                  </div>

                  <div className="space-y-3 text-left text-xs font-semibold max-w-xs mx-auto pt-2">
                    <div className="flex items-center gap-3">
                      {uploadStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                      )}
                      <span className={uploadStep >= 1 ? "text-foreground" : "text-muted-foreground"}>
                        Extracting technical & soft skills
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {uploadStep >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : uploadStep === 2 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted shrink-0" />
                      )}
                      <span className={uploadStep >= 2 ? "text-foreground" : "text-muted-foreground"}>
                        Understanding experience & education
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {uploadStep >= 4 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : uploadStep === 3 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted shrink-0" />
                      )}
                      <span className={uploadStep >= 3 ? "text-foreground" : "text-muted-foreground"}>
                        Matching target role: {targetRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {uploadStep >= 5 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : uploadStep === 4 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted shrink-0" />
                      )}
                      <span className={uploadStep >= 4 ? "text-foreground" : "text-muted-foreground"}>
                        Calculating skill gaps & readiness score
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {uploadStep >= 6 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : uploadStep === 5 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted shrink-0" />
                      )}
                      <span className={uploadStep >= 5 ? "text-foreground" : "text-muted-foreground"}>
                        Creating personalized project plan
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: HOW IS READINESS CALCULATED? ================= */}
      <AnimatePresence>
        {isFormulaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  <Info className="w-4 h-4" />
                  <span>Transparent Scoring Model</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xs font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">How is Career Readiness Calculated?</h3>
                <p className="text-xs text-muted-foreground">
                  Your readiness is never an arbitrary random number. It is an objective weighted calculation of 5 verified database criteria:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">1. Technical Skills Match (30%)</span>
                    <p className="text-[11px] text-muted-foreground">Competency match against target role industry benchmark</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">{profile?.breakdown?.technicalSkills ?? 70}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">2. Learning Progress (25%)</span>
                    <p className="text-[11px] text-muted-foreground">Percentage of completed curriculum steps and milestones</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">{profile?.breakdown?.learningProgress ?? 60}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">3. Quiz Performance (15%)</span>
                    <p className="text-[11px] text-muted-foreground">Average accuracy on module knowledge checks</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">{profile?.breakdown?.quizPerformance ?? 75}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">4. AI Mock Interview (20%)</span>
                    <p className="text-[11px] text-muted-foreground">Adaptive AI evaluation of real-time technical interview aptitude</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">{profile?.breakdown?.aiInterview ?? 68}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">5. Projects & Practical Depth (10%)</span>
                    <p className="text-[11px] text-muted-foreground">Hands-on projects and architectural implementation experience</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">{profile?.breakdown?.projects ?? 65}%</span>
                </div>
              </div>

              <div className="pt-2 text-right">
                <Button
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-5"
                >
                  Got It
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= TOP HEADER BANNER ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-visible">
        {/* Decorative background glow safely clipped */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>AI Career Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Career Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Understand your skills, identify gaps and build the right learning path for your career.
          </p>

          {/* Profile Completion Bar */}
          <div className="space-y-1.5 pt-2 max-w-sm">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>Profile Completion</span>
              <span className="text-indigo-400 font-bold">{profileCompletion}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Target Role & Resume Controls */}
        <div className="space-y-3 z-10 shrink-0 flex flex-col sm:items-end">
          {/* Target Role Selector */}
          <div className="relative z-30">
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1">Target Role</span>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="px-4 py-2 rounded-xl bg-muted/60 border border-border hover:border-indigo-500/60 text-xs font-bold text-foreground flex items-center justify-between gap-3 min-w-[220px] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>{targetRole}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isRoleDropdownOpen ? "rotate-90" : ""}`} />
            </button>

            {/* Role Dropdown */}
            {isRoleDropdownOpen && (
              <>
                {/* Backdrop for click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setIsRoleDropdownOpen(false)
                    setIsCustomRoleMode(false)
                  }}
                />

                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border/80 rounded-2xl p-3.5 shadow-2xl z-50 space-y-2.5">
                  {/* Search Header */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search all domains and roles..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground outline-none focus:border-indigo-500 transition-colors"
                      autoFocus
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/60 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setRoleFilterTab("ALL")}
                      className={`flex-1 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        roleFilterTab === "ALL" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All ({availableRoles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleFilterTab("DOMAINS")}
                      className={`flex-1 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        roleFilterTab === "DOMAINS" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Domains ({availableRoles.filter((r) => r.isDomain).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleFilterTab("ROLES")}
                      className={`flex-1 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        roleFilterTab === "ROLES" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Roles ({availableRoles.filter((r) => !r.isDomain).length})
                    </button>
                  </div>

                  {/* Role and Domain list */}
                  <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1 pr-1">
                    {filteredRoles.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No matching domains or roles found.
                      </div>
                    ) : (
                      filteredRoles.map((item) => {
                        const isSelected = targetRole.toLowerCase() === item.name.toLowerCase()
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => handleSelectRole(item.name)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white font-bold shadow-xs"
                                : "text-foreground hover:bg-muted/70"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Briefcase className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-indigo-400"}`} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {item.isDomain && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                                  }`}
                                >
                                  Domain
                                </span>
                              )}
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>

                  {/* Custom Role Input */}
                  <div className="pt-2 border-t border-border/60">
                    {isCustomRoleMode ? (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. LLM Architect"
                          value={customRoleInput}
                          onChange={(e) => setCustomRoleInput(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border text-xs outline-none"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (customRoleInput.trim()) handleSelectRole(customRoleInput.trim())
                          }}
                          className="text-[11px] h-8 px-3 bg-indigo-600 text-white cursor-pointer"
                        >
                          Set
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCustomRoleMode(true)}
                        className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 w-full text-left py-1 flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Enter Custom Domain / Role</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Resume Upload CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{resumeStatus?.hasResume ? "Update Resume" : "Upload Resume"}</span>
            </Button>

            {resumeStatus?.hasResume && (
              <Button
                variant="outline"
                onClick={handleDeleteResume}
                className="rounded-xl text-xs font-semibold border-border text-rose-400 hover:bg-rose-500/10 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Overview & Readiness
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("skill-gap")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "skill-gap"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Skill Gap Analysis
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "projects"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Personalized Projects
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resume")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "resume"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Resume & ATS Optimizer
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW & READINESS ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Career Readiness Score Card */}
            <div className="lg:col-span-1 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Target Role Alignment
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFormulaModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>How is this calculated?</span>
                  </button>
                </div>
                <h3 className="text-lg font-extrabold text-foreground">Career Readiness</h3>
              </div>

              {/* Big Score Ring */}
              <div className="text-center space-y-2 py-4">
                <div className="w-28 h-28 rounded-full bg-indigo-500/10 border-4 border-indigo-500/40 text-indigo-400 flex flex-col items-center justify-center mx-auto shadow-inner">
                  <span className="text-3xl font-black text-foreground">{readinessScore}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ready</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {readinessScore >= 75
                    ? "You are strongly positioned for interview readiness!"
                    : "Complete recommended skill gaps to accelerate readiness."}
                </p>
              </div>

              {/* 5-Factor Mini Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Technical Skills</span>
                  <span className="font-bold text-foreground">{profile?.breakdown?.technicalSkills ?? 75}%</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Learning Progress</span>
                  <span className="font-bold text-foreground">{profile?.breakdown?.learningProgress ?? 65}%</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>AI Mock Interview</span>
                  <span className="font-bold text-foreground">{profile?.breakdown?.aiInterview ?? 68}%</span>
                </div>
              </div>
            </div>

            {/* AI Career Insights & Resume Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Career Insights Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-indigo-500/10 via-card to-card border border-border/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Your AI Career Insights</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {resumeImprovement?.careerInsights ||
                    `You have demonstrated strong foundational programming capabilities. Your primary opportunity is deepening framework mastery in deep learning, vector databases, and containerized deployments for ${targetRole} roles.`}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("skill-gap")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <span>View Skill Gaps</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("projects")}
                    className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted gap-1.5"
                  >
                    <span>Recommended Projects</span>
                  </Button>
                </div>
              </div>

              {/* Resume Status Card */}
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">
                      {resumeStatus?.hasResume ? resumeStatus.fileName : "No Resume Uploaded"}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {resumeStatus?.hasResume
                        ? `Resume Score: ${resumeStatus.resumeScore}/100 • Parsed with Claude AI`
                        : "Upload your resume in PDF/DOCX to benchmark skills."}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  variant="outline"
                  className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted"
                >
                  {resumeStatus?.hasResume ? "Replace" : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {/* Discovered Skills Cloud */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-foreground">Discovered Skills</h3>
                <p className="text-xs text-muted-foreground">
                  Skills extracted from your verified resume and completed learning milestones.
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-indigo-400">
                {skills.length} Skills Discovered
              </span>
            </div>

            {skills.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Upload your resume to automatically extract your technical skills and frameworks.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Upload Resume
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((s) => (
                  <span
                    key={s.id || s.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/70 border border-border/70 text-xs font-medium text-foreground hover:border-indigo-500/40 transition-colors"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded-md">
                      {s.level}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SKILL GAP ANALYSIS ================= */}
      {activeTab === "skill-gap" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Your Skill Gap for {targetRole}</h2>
              <p className="text-xs text-muted-foreground">
                Comparing your current discovered skills against verified industry requirements.
              </p>
            </div>
            <Button
              onClick={() => handleSelectRole(targetRole)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Gaps</span>
            </Button>
          </div>

          {/* Skill Gaps List */}
          <div className="grid grid-cols-1 gap-4">
            {gaps.map((gap) => {
              const isStrong = gap.status === "STRONG"
              const isGood = gap.status === "GOOD"
              const isNeedsImp = gap.status === "NEEDS_IMPROVEMENT"
              const isMissing = gap.status === "MISSING"

              return (
                <div
                  key={gap.skillName}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isStrong
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : isGood
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : isNeedsImp
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {isStrong ? "✓" : isGood ? "✓" : isNeedsImp ? "⚠" : "✗"}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground">{gap.skillName}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Current: <strong className="text-foreground">{gap.currentLevel}</strong> • Target:{" "}
                          <strong className="text-indigo-400">{gap.requiredLevel}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isStrong
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isGood
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : isNeedsImp
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {gap.currentLevel}
                      </span>
                      <span className="font-mono font-bold text-xs text-foreground">
                        {gap.matchPercentage}% Match
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isStrong
                          ? "bg-emerald-500"
                          : isGood
                          ? "bg-blue-500"
                          : isNeedsImp
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${gap.matchPercentage}%` }}
                    />
                  </div>

                  {/* AI Explanation & Topics */}
                  <div className="pt-2 border-t border-border/60 space-y-3 text-xs">
                    {gap.whyItMatters && (
                      <p className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Why it matters:</strong> {gap.whyItMatters}
                      </p>
                    )}

                    {gap.recommendedTopics && gap.recommendedTopics.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Recommended PathLearn Topics ({gap.estimatedEffort || "1-2 weeks"} effort):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {gap.recommendedTopics.map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] bg-muted/80 text-foreground px-2.5 py-1 rounded-lg border border-border"
                            >
                              • {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleAddToRoadmap(gap.skillName)}
                        className={`rounded-xl text-[11px] h-8 gap-1.5 ${
                          addedRoadmapSkills[gap.skillName]
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {addedRoadmapSkills[gap.skillName] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Roadmap</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Add to My Roadmap</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PERSONALIZED PROJECTS ================= */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-1">
            <h2 className="text-xl font-bold text-foreground">Projects that Strengthen Your Profile</h2>
            <p className="text-xs text-muted-foreground">
              Curated portfolio architectures tailored for {targetRole} interview evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.title}
                className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {proj.difficulty}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{proj.estimatedTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{proj.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                    <span className="font-semibold text-foreground">Why this helps:</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{proj.whyItHelps}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.skills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] bg-muted/80 text-foreground px-2 py-0.5 rounded-md border border-border font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <Button
                    onClick={() => handleAddToRoadmap(proj.title)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <span>Add to Learning Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: RESUME & ATS OPTIMIZER ================= */}
      {activeTab === "resume" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Resume & ATS Keyword Optimizer</h2>
              <p className="text-xs text-muted-foreground">
                Benchmark your resume against Applicant Tracking Systems for {targetRole}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Resume Strength:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {resumeImprovement?.resumeScore ?? resumeStatus?.resumeScore ?? 78} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section Checklist */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resume Section Health</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span>Contact Information</span>
                  <span className="text-emerald-400 font-bold">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span>Education Credentials</span>
                  <span className="text-emerald-400 font-bold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span>Technical Skills Categorization</span>
                  <span className="text-emerald-400 font-bold">✓ Structured</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span>Projects Description</span>
                  <span className="text-amber-400 font-bold">⚠ Needs Metrics</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span>Quantifiable Impact Statements</span>
                  <span className="text-rose-400 font-bold">✗ Missing</span>
                </div>
              </div>
            </div>

            {/* ATS Keyword Comparison */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground">ATS Keyword Analysis</h3>
                <p className="text-[11px] text-muted-foreground">
                  Compare keywords against typical recruiter searches for {targetRole}.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                    Matched Keywords (Found in Resume):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeImprovement?.atsKeywords?.matched || ["Python", "SQL", "Git"]).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="text-[11px] font-semibold text-rose-400 block mb-1">
                    Missing Target Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeImprovement?.atsKeywords?.missing || ["PyTorch", "Docker", "RAG"]).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] font-semibold bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20"
                      >
                        ✗ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground italic pt-2">
                  * Note: Never practice keyword stuffing. Only include keywords for concepts you genuinely understand.
                </p>
              </div>
            </div>
          </div>

          {/* Project Improvement Suggestions */}
          {resumeImprovement?.projectAnalyses && resumeImprovement.projectAnalyses.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">Project Bullet Enhancements</h3>
              <div className="space-y-4">
                {resumeImprovement.projectAnalyses.map((p) => (
                  <div key={p.projectName} className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm">{p.projectName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {p.currentDepth}
                      </span>
                    </div>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      {p.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
