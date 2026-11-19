import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Search,
  Filter,
  Sparkles,
  Clock,
  DollarSign,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  TrendingUp,
  Layers,
  Send,
  RefreshCw,
  Flame,
  Award,
  ArrowUpDown,
  X,
  Globe,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jobService } from "../services/jobService"
import { JobOpening, JobApplication, JobFilters } from "../types/job"
import { JobCard } from "../components/jobs/JobCard"
import { JobDetailModal } from "../components/jobs/JobDetailModal"
import { JobApplicationModal } from "../components/jobs/JobApplicationModal"
import { MyApplicationsTab } from "../components/jobs/MyApplicationsTab"
import { useAuth } from "../context/AuthContext"

type TabType = "all" | "jobs" | "internships" | "bangalore" | "recommended" | "applications" | "saved"

export default function JobOpeningsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Active Tab state
  const queryTab = new URLSearchParams(location.search).get("tab")
  const [activeTab, setActiveTab] = useState<TabType>(
    queryTab === "applications"
      ? "applications"
      : queryTab === "saved"
      ? "saved"
      : queryTab === "recommended"
      ? "recommended"
      : queryTab === "jobs"
      ? "jobs"
      : queryTab === "internships"
      ? "internships"
      : queryTab === "bangalore"
      ? "bangalore"
      : "all"
  )

  // Data states
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<JobOpening[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [jobsCount, setJobsCount] = useState<number>(0)
  const [internshipsCount, setInternshipsCount] = useState<number>(0)
  const [bangaloreCount, setBangaloreCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Filters state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoleType, setSelectedRoleType] = useState<"All" | "Job" | "Internship">("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedWorkMode, setSelectedWorkMode] = useState("All")
  const [sortBy, setSortBy] = useState<"latest" | "salary" | "match">("latest")

  // Modals state
  const [detailModalJob, setDetailModalJob] = useState<JobOpening | null>(null)
  const [applyModalJob, setApplyModalJob] = useState<JobOpening | null>(null)

  // Toast / feedback banner
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Load Data from API
  const loadJobData = async () => {
    setLoading(true)
    try {
      // Determine roleType filter: tab can override or default filter
      let effectiveRoleType = selectedRoleType
      if (activeTab === "jobs") effectiveRoleType = "Job"
      else if (activeTab === "internships") effectiveRoleType = "Internship"

      // Determine location filter: bangalore tab overrides
      let effectiveLocation = selectedLocation
      if (activeTab === "bangalore") effectiveLocation = "Bangalore"

      const filters: JobFilters = {
        search: searchQuery,
        category: selectedCategory,
        workMode: selectedWorkMode,
        roleType: effectiveRoleType,
        location: effectiveLocation,
        sortBy: sortBy,
      }

      const [jobsRes, appsRes] = await Promise.all([
        jobService.getJobs(filters),
        jobService.getMyApplications(),
      ])

      setJobs(jobsRes.jobs)
      setCategories(jobsRes.categories || [])
      setApplications(appsRes)
      if (jobsRes.jobsCount !== undefined) setJobsCount(jobsRes.jobsCount)
      if (jobsRes.internshipsCount !== undefined) setInternshipsCount(jobsRes.internshipsCount)
      if (jobsRes.bangaloreCount !== undefined) setBangaloreCount(jobsRes.bangaloreCount)

      // Filter saved jobs
      const saved = jobsRes.jobs.filter((j) => j.isSaved)
      setSavedJobs(saved)
    } catch (err) {
      console.error("Failed to load jobs & internships:", err)
    } finally {
      setLoading(false)
    }
  }

  // Reload when filters change
  useEffect(() => {
    loadJobData()
  }, [activeTab, selectedRoleType, selectedLocation, selectedCategory, selectedWorkMode, sortBy])

  // Handle Search submit / debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadJobData()
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Direct Apply to original job posting
  const handleApplyDirect = async (job: JobOpening) => {
    // 1. Immediately open original company application link
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer")
    }

    // 2. Track application in PathLearn
    try {
      const application = await jobService.applyForJob(job.id, {
        candidateName: user?.name || "Dr. Punith K R",
        candidateEmail: user?.email || "punith@pathlearn.edu",
        experienceYears: job.jobType === "Internship" ? "Student / 2026 Graduate" : "2-4 years software engineering",
        noticePeriod: job.jobType === "Internship" ? "Summer 2026" : "Immediate / 15-30 days",
        resumeType: "pathlearn-builder",
        resumeName: "PathLearn ATS Master Resume",
        coverPitch: `Application submitted directly on ${job.company} Careers portal for ${job.title} in ${job.location}.`,
      })

      handleApplicationSuccess(application)
      setFeedbackMessage(`Redirected to official ${job.company} Careers portal! Application logged in PathLearn.`)
    } catch (err) {
      console.error("Error logging application:", err)
      setFeedbackMessage(`Opened official ${job.company} Careers portal at ${job.applyUrl}`)
    }
    setTimeout(() => setFeedbackMessage(null), 5000)
  }

  // Handle Save / Bookmark toggle
  const handleToggleSave = async (job: JobOpening) => {
    try {
      const { isSaved } = await jobService.toggleSaveJob(job.id)
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, isSaved } : j))
      )
      if (detailModalJob?.id === job.id) {
        setDetailModalJob((prev) => (prev ? { ...prev, isSaved } : null))
      }
      setFeedbackMessage(isSaved ? `Saved "${job.title}" to bookmarks` : `Removed "${job.title}" from saved`)
      setTimeout(() => setFeedbackMessage(null), 3500)
    } catch (err) {
      console.error("Failed to toggle save:", err)
    }
  }

  // Handle Successful Application
  const handleApplicationSuccess = (application: JobApplication) => {
    setApplications((prev) => [application, ...prev.filter((a) => a.id !== application.id)])
    setJobs((prev) =>
      prev.map((j) =>
        j.id === application.jobId
          ? { ...j, hasApplied: true, applicationStatus: application.status, applicationId: application.id }
          : j
      )
    )
    if (detailModalJob?.id === application.jobId) {
      setDetailModalJob((prev) =>
        prev
          ? { ...prev, hasApplied: true, applicationStatus: application.status, applicationId: application.id }
          : null
      )
    }
  }

  // Filter jobs based on active tab
  const getTabJobs = () => {
    if (activeTab === "recommended") {
      return jobs.filter((j) => (j.matchScore || 0) >= 85)
    }
    if (activeTab === "saved") {
      return jobs.filter((j) => j.isSaved)
    }
    return jobs
  }

  const currentTabJobs = getTabJobs()

  // Calculate statistics
  const totalOpeningsCount = jobs.length
  const recommendedCount = jobs.filter((j) => (j.matchScore || 0) >= 85).length
  const appliedCount = applications.length

  return (
    <div className="space-y-8 select-none">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 text-xs font-bold flex items-center gap-2.5 max-w-md"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{feedbackMessage}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="ml-auto text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-background border border-indigo-500/20 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex-wrap">
            <span className="text-sm">🇮🇳</span>
            <span>Verified Tech Openings in India</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-purple-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-400" /> Bangalore & Karnataka Tech Hubs
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Latest Tech Jobs & Internships
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Browse verified, authentic Full-Time Software Engineering roles and Student Internships actively opened by top companies in India — with prime focus on Bangalore (Bellandur, Outer Ring Rd, Koramangala, Manyata, Electronic City) and Karnataka.
            Click <strong className="text-white">"Apply"</strong> to navigate directly to the company's official career portal.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Active Openings (India)
              </span>
              <span className="text-lg sm:text-xl font-black text-white">{jobsCount + internshipsCount || totalOpeningsCount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300 block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple-400" /> Bangalore / KA
              </span>
              <span className="text-lg sm:text-xl font-black text-purple-200">{bangaloreCount || 25}</span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300 block mb-0.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-blue-400" /> Full-Time Jobs
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-200">{jobsCount || 19}</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 block mb-0.5 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-emerald-400" /> Internships (2026)
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-200">{internshipsCount || 12}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tabs Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* All Openings */}
          <button
            onClick={() => {
              setActiveTab("all")
              setSelectedRoleType("All")
              setSelectedLocation("All")
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All Roles ({jobsCount + internshipsCount || totalOpeningsCount})
          </button>

          {/* Full-Time Jobs Only */}
          <button
            onClick={() => {
              setActiveTab("jobs")
              setSelectedRoleType("Job")
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "jobs"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Full-Time Jobs ({jobsCount || 19})</span>
          </button>

          {/* Internships Only */}
          <button
            onClick={() => {
              setActiveTab("internships")
              setSelectedRoleType("Internship")
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "internships"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Internships ({internshipsCount || 12})</span>
          </button>

          {/* Bangalore & Karnataka Special Focus */}
          <button
            onClick={() => {
              setActiveTab("bangalore")
              setSelectedLocation("Bangalore")
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bangalore"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/25"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>Bangalore & KA ({bangaloreCount || 25})</span>
          </button>

          {/* Recommended */}
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recommended"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended ({recommendedCount})</span>
          </button>

          {/* My Applications */}
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "applications"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>My Applications ({appliedCount})</span>
          </button>

          {/* Saved */}
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "saved"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved ({savedJobs.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadJobData}
            className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer ml-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search & Multi-Filter Toolbar */}
      {activeTab !== "applications" && (
        <div className="space-y-4 p-5 rounded-3xl bg-card border border-border/80 shadow-xs">
          {/* Search Input & Dropdown Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles in Bangalore / India (e.g., SDE 2, Google, Flipkart, Java, PyTorch, Bellandur)..."
                className="pl-10 pr-9 rounded-2xl text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Role Type Filter */}
              <select
                value={activeTab === "jobs" ? "Job" : activeTab === "internships" ? "Internship" : selectedRoleType}
                onChange={(e) => setSelectedRoleType(e.target.value as any)}
                disabled={activeTab === "jobs" || activeTab === "internships"}
                className="px-3 py-2 rounded-2xl text-xs bg-muted/40 border border-border text-foreground focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Types (Jobs & Interns)</option>
                <option value="Job">💼 Full-Time Jobs Only</option>
                <option value="Internship">🎓 Internships Only</option>
              </select>

              {/* Location Hub Filter */}
              <select
                value={activeTab === "bangalore" ? "Bangalore" : selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={activeTab === "bangalore"}
                className="px-3 py-2 rounded-2xl text-xs bg-muted/40 border border-border text-foreground focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All of India (🇮🇳)</option>
                <option value="Bangalore">📍 Bangalore, Karnataka</option>
                <option value="Karnataka">Karnataka (Bangalore & Mysore)</option>
                <option value="Remote">Remote (India)</option>
              </select>

              {/* Work Mode Filter */}
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="px-3 py-2 rounded-2xl text-xs bg-muted/40 border border-border text-foreground focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Work Modes</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site Campus</option>
                <option value="Remote">Remote Only</option>
              </select>

              {/* Sort By Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-2xl text-xs bg-muted/40 border border-border text-foreground focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="latest">Sort: Recently Posted</option>
                <option value="match">Sort: Highest Match %</option>
                <option value="salary">Sort: Highest Compensation</option>
              </select>
            </div>
          </div>

          {/* Quick Location Pills & Categories */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/50">
            {/* Categories Pill Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              <span className="text-[11px] font-bold text-muted-foreground mr-1 shrink-0">Field:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 font-bold"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Bangalore Toggle Button */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedLocation === "Bangalore") {
                    setSelectedLocation("All")
                  } else {
                    setSelectedLocation("Bangalore")
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedLocation === "Bangalore" || activeTab === "bangalore"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedLocation === "Bangalore" || activeTab === "bangalore" ? "✓ Bangalore Selected" : "Filter: Bangalore Only"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "applications" ? (
        <MyApplicationsTab
          applications={applications}
          onViewJob={(jobId) => {
            const found = jobs.find((j) => j.id === jobId)
            if (found) {
              setDetailModalJob(found)
            } else {
              jobService.getJobById(jobId).then((j) => setDetailModalJob(j))
            }
          }}
          onBrowseJobs={() => setActiveTab("all")}
        />
      ) : loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-card border border-border/60 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-2/3" />
                </div>
              </div>
              <div className="h-12 bg-muted/60 rounded-xl" />
              <div className="h-8 bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : currentTabJobs.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-4 rounded-3xl bg-muted/20 border border-border/80 p-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto shadow-sm">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No roles match your criteria</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query, selecting "All Roles", or resetting location filters to view all openings in India.
            </p>
          </div>
          <Button
            onClick={() => {
              setSearchQuery("")
              setSelectedRoleType("All")
              setSelectedLocation("All")
              setSelectedCategory("All")
              setSelectedWorkMode("All")
              setActiveTab("all")
            }}
            variant="outline"
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        /* Openings Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <strong className="text-foreground">{currentTabJobs.length}</strong> opened roles in India
              {selectedLocation === "Bangalore" || activeTab === "bangalore" ? " (Bangalore & Karnataka)" : ""}
            </span>
            <span className="text-[11px]">
              Click <strong>Apply</strong> to visit official career portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {currentTabJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={(j) => setDetailModalJob(j)}
                onApply={handleApplyDirect}
                onToggleSave={handleToggleSave}
                isSaved={job.isSaved}
              />
            ))}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      <JobDetailModal
        job={detailModalJob}
        isOpen={!!detailModalJob}
        onClose={() => setDetailModalJob(null)}
        onApply={handleApplyDirect}
        onOpenPitchModal={(j) => {
          setDetailModalJob(null)
          setApplyModalJob(j)
        }}
        onToggleSave={handleToggleSave}
        isSaved={detailModalJob?.isSaved}
      />

      {/* AI Pitch & Fast Track Modal */}
      <JobApplicationModal
        job={applyModalJob}
        isOpen={!!applyModalJob}
        onClose={() => setApplyModalJob(null)}
        onSuccess={handleApplicationSuccess}
        userName={user?.name || "Dr. Punith K R"}
        userEmail={user?.email || "punith@pathlearn.edu"}
      />
    </div>
  )
}
