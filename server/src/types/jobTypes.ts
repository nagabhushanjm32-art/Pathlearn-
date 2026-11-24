export interface JobOpening {
  id: string
  title: string
  company: string
  companyLogo: string
  companyWebsite: string
  location: string
  locationCity?: string
  locationState?: string
  workMode: "Remote" | "Hybrid" | "On-Site"
  category:
    | "Software Engineering"
    | "Full Stack"
    | "AI & Machine Learning"
    | "Frontend & Web"
    | "Backend Systems"
    | "Data Science & Analytics"
    | "Cloud & DevOps"
    | "Research & Hardware"
    | "All"
  jobType: "Full-Time" | "Internship" | "Contract" | "Part-Time"
  experienceLevel: "Entry Level" | "Mid Level" | "Senior Level" | "Lead / Staff"
  salary: string
  postedAt: string
  postedDate: string
  deadline: string
  applicantsCount: number
  tags: string[]
  description: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  benefits: string[]
  featured?: boolean
  urgentHiring?: boolean
  applyUrl: string
  sourcePlatform?: "LinkedIn" | "Naukri" | "Indeed" | "Monster/Foundit" | "Internshala" | "Wellfound" | "Direct Company"
  companyType?: "Startup" | "Product Scaleup" | "Enterprise" | "AI Startup" | "Tech Services"
}

export type ApplicationStatus = "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFER_EXTENDED"

export interface JobApplication {
  id: string
  jobId: string
  jobTitle: string
  company: string
  companyLogo: string
  userId: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  portfolioUrl?: string
  linkedInUrl?: string
  githubUrl?: string
  experienceYears: string
  noticePeriod: string
  resumeType: "pathlearn-builder" | "uploaded" | "custom"
  resumeName: string
  resumeUrl?: string
  coverPitch: string
  matchScore: number
  status: ApplicationStatus
  appliedAt: string
  statusNotes?: string
  applyUrl?: string
  location?: string
  jobType?: string
}

export interface JobFilters {
  search?: string
  category?: string
  workMode?: string
  jobType?: string
  roleType?: "All" | "Job" | "Internship"
  location?: string
  experienceLevel?: string
  platform?: string
  companyType?: string
  sortBy?: "latest" | "salary" | "match"
}
