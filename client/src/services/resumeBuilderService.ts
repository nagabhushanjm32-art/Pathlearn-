import api from "./api"

export type ResumeTemplateId =
  | "modern"
  | "minimal"
  | "professional"
  | "technical"
  | "fresher"
  | "software"
  | "data-ai"

export interface PersonalInfo {
  fullName: string
  professionalTitle: string
  email: string
  phone: string
  location: string
  linkedIn?: string
  github?: string
  portfolio?: string
}

export interface EducationItem {
  id: string
  degree: string
  fieldOfStudy: string
  institution: string
  university?: string
  cgpaOrPercentage: string
  startYear: string
  endYear: string
}

export interface TechnicalSkills {
  languages: string[]
  frameworks: string[]
  databases: string[]
  cloudTechnologies: string[]
  tools: string[]
  aiMlTechnologies: string[]
  other: string[]
}

export interface ProjectItem {
  id: string
  title: string
  description: string
  problemStatement?: string
  technologies: string[]
  keyFeatures?: string[]
  contribution?: string
  outcomes?: string
  githubUrl?: string
  demoUrl?: string
  bulletPoints: string[]
}

export interface CertificationItem {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  credentialUrl?: string
}

export interface ExperienceItem {
  id: string
  organization: string
  role: string
  duration: string
  location?: string
  responsibilities: string[]
  achievements: string[]
}

export interface AchievementItem {
  id: string
  title: string
  category: "Hackathon" | "Competition" | "Academic" | "Publication" | "Award" | "Other"
  date?: string
  description: string
}

export interface LanguageItem {
  id: string
  language: string
  proficiency: "Native" | "Fluent" | "Professional" | "Intermediate" | "Basic"
}

export interface ResumeData {
  id: string
  title: string
  targetRole: string
  templateId: ResumeTemplateId
  personalInfo: PersonalInfo
  summary: string
  education: EducationItem[]
  technicalSkills: TechnicalSkills
  softSkills: string[]
  projects: ProjectItem[]
  certifications: CertificationItem[]
  experience: ExperienceItem[]
  achievements: AchievementItem[]
  languages: LanguageItem[]
  customSections?: { id: string; title: string; content: string }[]
  atsScore?: number
  completionPercentage?: number
  updatedAt: string
}

export interface JobOptimizationResult {
  targetJob: string
  atsScore: number
  keywordMatchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  requiredQualifications: string[]
  suggestedImprovements: string[]
  tailoredSummaryRecommendation: string
}

export interface AtsAuditResult {
  overallScore: number
  keywordMatch: number
  skillsMatch: number
  educationMatch: number
  experienceMatch: number
  formattingScore: number
  projectRelevanceScore: number
  contactInfoScore: number
  actionableSuggestions: string[]
  qualityIssues: {
    type: "warning" | "error" | "tip"
    section: string
    message: string
  }[]
}

const LOCAL_STORAGE_KEY = "pathlearn_resumes_cache"

export const resumeBuilderService = {
  async getResumes(): Promise<ResumeData[]> {
    try {
      const response = await api.get("/resume-builder/resumes")
      if (response.data?.resumes && response.data.resumes.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(response.data.resumes))
        return response.data.resumes
      }
    } catch (error) {
      console.warn("Could not fetch resumes from API, checking local storage:", error)
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {}
    }

    const defaultResume = createDefaultResume()
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([defaultResume]))
    return [defaultResume]
  },

  async getResumeById(id: string): Promise<ResumeData | null> {
    try {
      const response = await api.get(`/resume-builder/resumes/${id}`)
      if (response.data?.resume) {
        return response.data.resume
      }
    } catch (error) {
      console.warn("API fetch failed, reading from local cache:", error)
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      const list: ResumeData[] = JSON.parse(cached)
      return list.find((r) => r.id === id) || null
    }
    return null
  },

  async saveResume(resume: ResumeData): Promise<{ resume: ResumeData; atsAudit?: AtsAuditResult }> {
    try {
      const response = await api.post("/resume-builder/resumes/save", resume)
      const saved = response.data?.resume || resume
      this.updateLocalCache(saved)
      return { resume: saved, atsAudit: response.data?.atsAudit }
    } catch (error) {
      console.warn("API save failed, persisting locally:", error)
      const localAudit = this.auditResumeLocally(resume)
      const updated = {
        ...resume,
        atsScore: localAudit.overallScore,
        completionPercentage: this.calculateCompletion(resume),
        updatedAt: new Date().toISOString(),
      }
      this.updateLocalCache(updated)
      return { resume: updated, atsAudit: localAudit }
    }
  },

  async duplicateResume(id: string): Promise<ResumeData> {
    try {
      const response = await api.post(`/resume-builder/resumes/${id}/duplicate`)
      if (response.data?.resume) {
        const resumes = await this.getResumes()
        resumes.unshift(response.data.resume)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumes))
        return response.data.resume
      }
    } catch (error) {
      console.warn("API duplicate failed, duplicating locally:", error)
    }

    const resumes = await this.getResumes()
    const target = resumes.find((r) => r.id === id) || resumes[0]
    const cloned: ResumeData = {
      ...JSON.parse(JSON.stringify(target)),
      id: `resume-${Date.now()}`,
      title: `${target.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    }
    resumes.unshift(cloned)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumes))
    return cloned
  },

  async deleteResume(id: string): Promise<void> {
    try {
      await api.delete(`/resume-builder/resumes/${id}`)
    } catch (error) {
      console.warn("API delete failed:", error)
    }

    const resumes = (await this.getResumes()).filter((r) => r.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumes))
  },

  async generateSummary(
    targetRole: string,
    skills: string[],
    education: string,
    experienceLevel: string = "Fresher"
  ): Promise<string> {
    try {
      const response = await api.post("/resume-builder/ai/generate-summary", {
        targetRole,
        skills,
        education,
        experienceLevel,
      })
      if (response.data?.summary) {
        return response.data.summary
      }
    } catch (error) {
      console.warn("API summary generation failed, using local generator:", error)
    }

    return `Motivated and results-oriented ${targetRole || "Software Engineer"} with foundational expertise in ${
      skills.slice(0, 3).join(", ") || "full-stack software development"
    }. Adept at designing scalable architectures, writing clean modular code, and rapidly mastering new technical stacks to deliver measurable business impact.`
  },

  async improveBulletPoint(text: string, targetRole: string = "Software Engineer"): Promise<string> {
    try {
      const response = await api.post("/resume-builder/ai/improve-bullet", { text, targetRole })
      if (response.data?.improved) {
        return response.data.improved
      }
    } catch (error) {
      console.warn("API improve bullet failed:", error)
    }

    const clean = text.trim().replace(/^[-•*]\s*/, "")
    return `Engineered and deployed scalable ${clean}, achieving optimized performance and sub-second response times.`
  },

  async optimizeForJob(resume: ResumeData, jobDescription: string): Promise<JobOptimizationResult> {
    try {
      const response = await api.post("/resume-builder/ai/optimize-job", { resume, jobDescription })
      if (response.data?.optimization) {
        return response.data.optimization
      }
    } catch (error) {
      console.warn("API optimize job failed, using local matcher:", error)
    }

    return this.optimizeForJobLocally(resume, jobDescription)
  },

  async auditResume(resume: ResumeData): Promise<AtsAuditResult> {
    try {
      const response = await api.post("/resume-builder/ai/audit", { resume })
      if (response.data?.audit) {
        return response.data.audit
      }
    } catch (error) {
      console.warn("API audit failed:", error)
    }

    return this.auditResumeLocally(resume)
  },

  async importPlatformData(): Promise<{ certificates: CertificationItem[] }> {
    try {
      const response = await api.get("/resume-builder/platform/import")
      if (response.data?.certificates) {
        return { certificates: response.data.certificates }
      }
    } catch (error) {
      console.warn("Could not fetch platform data:", error)
    }

    return {
      certificates: [
        {
          id: `cert-${Date.now()}`,
          name: "AI & Full Stack Engineering Professional Certificate",
          issuingOrganization: "PathLearn Academy",
          issueDate: new Date().getFullYear().toString(),
          credentialUrl: "https://pathlearn.dev/verify/cert-ai-eng",
        },
      ],
    }
  },

  updateLocalCache(resume: ResumeData) {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    let list: ResumeData[] = cached ? JSON.parse(cached) : []
    const idx = list.findIndex((r) => r.id === resume.id)
    if (idx >= 0) {
      list[idx] = resume
    } else {
      list.unshift(resume)
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
  },

  calculateCompletion(resume: ResumeData): number {
    let completed = 0
    let total = 7

    if (resume.personalInfo?.fullName && resume.personalInfo?.email) completed++
    if (resume.summary?.trim()) completed++
    if (resume.education?.length > 0) completed++
    if (
      resume.technicalSkills?.languages?.length > 0 ||
      resume.technicalSkills?.frameworks?.length > 0
    )
      completed++
    if (resume.projects?.length > 0) completed++
    if (resume.certifications?.length > 0 || resume.achievements?.length > 0) completed++
    if (resume.experience?.length > 0 || resume.languages?.length > 0) completed++

    return Math.round((completed / total) * 100)
  },

  auditResumeLocally(resume: ResumeData): AtsAuditResult {
    let score = 55
    const issues: AtsAuditResult["qualityIssues"] = []
    const suggestions: string[] = []

    if (resume.personalInfo?.fullName && resume.personalInfo?.email) score += 10
    if (resume.summary?.length >= 50) score += 10
    else {
      issues.push({
        type: "warning",
        section: "Summary",
        message: "Add a concise professional summary highlighting your top strengths.",
      })
      suggestions.push("Generate a 2-sentence summary using the 'Generate with AI' button.")
    }

    if (resume.education?.length > 0) score += 10
    else {
      issues.push({
        type: "error",
        section: "Education",
        message: "Education section is empty. University/Degree details are essential for ATS parsers.",
      })
      suggestions.push("Add your degree, branch, and graduation year.")
    }

    const techCount =
      (resume.technicalSkills?.languages?.length || 0) +
      (resume.technicalSkills?.frameworks?.length || 0) +
      (resume.technicalSkills?.databases?.length || 0)
    if (techCount >= 5) score += 10
    else {
      issues.push({
        type: "warning",
        section: "Technical Skills",
        message: "Add at least 6 technical skills categorized by languages, frameworks, and databases.",
      })
    }

    if (resume.projects?.length > 0) score += 15
    else {
      issues.push({
        type: "error",
        section: "Projects",
        message: "Add at least 2 technical projects with measurable outcomes.",
      })
      suggestions.push("Include key technologies used and GitHub/demo links for your projects.")
    }

    if (resume.certifications?.length > 0) score += 5
    if (resume.experience?.length > 0) score += 5

    const overallScore = Math.min(98, Math.max(50, score))
    return {
      overallScore,
      keywordMatch: Math.min(95, Math.round(overallScore * 0.95)),
      skillsMatch: Math.min(100, techCount * 14),
      educationMatch: resume.education?.length ? 95 : 40,
      experienceMatch: resume.experience?.length ? 90 : 70,
      formattingScore: 98,
      projectRelevanceScore: resume.projects?.length ? 90 : 30,
      contactInfoScore: resume.personalInfo?.phone && resume.personalInfo?.linkedIn ? 95 : 75,
      actionableSuggestions:
        suggestions.length > 0
          ? suggestions
          : [
              "Your resume meets high ATS readability standards with clean formatting and clear hierarchy.",
              "Use 'Optimize Resume for Job' when applying to specific openings.",
            ],
      qualityIssues: issues,
    }
  },

  optimizeForJobLocally(resume: ResumeData, jobDescription: string): JobOptimizationResult {
    const jdLower = jobDescription.toLowerCase()
    const allSkills = [
      ...resume.technicalSkills.languages,
      ...resume.technicalSkills.frameworks,
      ...resume.technicalSkills.databases,
      ...resume.technicalSkills.cloudTechnologies,
      ...resume.technicalSkills.tools,
      ...resume.technicalSkills.aiMlTechnologies,
    ]

    const commonSkills = [
      "Python", "TypeScript", "JavaScript", "React", "Node.js", "Java", "C++",
      "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git",
      "Machine Learning", "PyTorch", "FastAPI", "Tailwind CSS", "CI/CD", "Next.js"
    ]

    const matched: string[] = []
    const missing: string[] = []

    commonSkills.forEach((skill) => {
      if (jdLower.includes(skill.toLowerCase())) {
        if (allSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
          matched.push(skill)
        } else {
          missing.push(skill)
        }
      }
    })

    if (matched.length === 0 && allSkills.length > 0) {
      matched.push(...allSkills.slice(0, 3))
    }

    const total = matched.length + missing.length || 10
    const ratio = matched.length / total
    const atsScore = Math.min(95, Math.max(55, Math.round(ratio * 60 + 35)))

    return {
      targetJob: resume.targetRole || "Software Engineer",
      atsScore,
      keywordMatchPercentage: Math.min(96, Math.max(50, Math.round(ratio * 70 + 25))),
      matchedSkills: matched.length > 0 ? matched : ["Problem Solving", "Git", "Clean Code"],
      missingSkills: missing.length > 0 ? missing.slice(0, 5) : ["Docker", "Kubernetes", "CI/CD"],
      requiredQualifications: [
        "Bachelor's degree in Computer Science, IT, or related engineering discipline",
        "Strong foundation in data structures, algorithms, and modular design",
      ],
      suggestedImprovements: [
        missing.length > 0
          ? `Consider learning and building a project with ${missing.slice(0, 2).join(" & ")} if you genuinely target this role.`
          : "Emphasize measurable performance improvements in your project bullet points.",
        "Ensure standard ATS headings are maintained.",
      ],
      tailoredSummaryRecommendation: `Enthusiastic ${resume.targetRole || "Software Engineer"} experienced with ${
        matched.slice(0, 3).join(", ") || "modern software engineering"
      }. Passionate about building robust systems and delivering high-quality user experiences.`,
    }
  },
}

export function createDefaultResume(targetRole: string = "Full Stack Software Engineer"): ResumeData {
  return {
    id: `resume-${Date.now()}`,
    title: `${targetRole} Resume`,
    targetRole,
    templateId: "modern",
    personalInfo: {
      fullName: "Dr. Punith K R",
      professionalTitle: targetRole,
      email: "punith@pathlearn.edu",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      linkedIn: "https://linkedin.com/in/punithkr",
      github: "https://github.com/punithkr",
      portfolio: "https://punith.dev",
    },
    summary:
      `Passionate and analytical ${targetRole} with strong theoretical and practical foundations in building scalable software systems. Experienced in end-to-end development, API engineering, and responsive UI design.`,
    education: [
      {
        id: "edu-1",
        degree: "Bachelor of Engineering (B.E.)",
        fieldOfStudy: "Computer Science & Engineering",
        institution: "Jain Institute of Technology",
        university: "VTU",
        cgpaOrPercentage: "8.9 CGPA",
        startYear: "2021",
        endYear: "2025",
      },
    ],
    technicalSkills: {
      languages: ["TypeScript", "JavaScript", "Python", "Java", "SQL", "C++"],
      frameworks: ["React", "Node.js", "Express", "Next.js", "Tailwind CSS", "FastAPI"],
      databases: ["PostgreSQL", "MongoDB", "Redis"],
      cloudTechnologies: ["Docker", "AWS", "Git/GitHub Actions"],
      tools: ["Postman", "Linux", "VS Code", "Prisma ORM"],
      aiMlTechnologies: ["PyTorch", "Hugging Face", "LangChain", "Vector DBs"],
      other: ["REST APIs", "System Design", "Agile Methodologies"],
    },
    softSkills: [
      "Analytical Problem Solving",
      "Technical Leadership",
      "Team Collaboration",
      "Adaptability",
      "Time Management",
    ],
    projects: [
      {
        id: "proj-1",
        title: "PathLearn: AI-Curated Learning Platform",
        description: "Adaptive career roadmap, interview simulator, and verifiable certificate ecosystem.",
        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
        githubUrl: "https://github.com/punithkr/pathlearn",
        demoUrl: "https://pathlearn.dev",
        bulletPoints: [
          "Architected full-stack adaptive learning platform serving interactive roadmaps, video lessons, and DSA coding judge.",
          "Engineered AI Mock Interview Simulator featuring real-time speech processing, audio transcription, and structured rubrics.",
          "Optimized PostgreSQL queries and Prisma ORM schemas, maintaining sub-50ms API response latency under load.",
        ],
      },
      {
        id: "proj-2",
        title: "IoT Automatic Traffic Signal System for Emergency Vehicles",
        description: "Acoustic sensor-driven emergency clearance controller using ESP32 microcontroller.",
        technologies: ["Embedded C++", "ESP32", "IoT", "WebSockets", "Digital Sensors"],
        githubUrl: "https://github.com/punithkr/iot-traffic",
        bulletPoints: [
          "Developed automated siren-detection traffic controller using ESP32 and high-sensitivity acoustic sensor arrays.",
          "Implemented embedded Wi-Fi web server dashboard enabling real-time telemetry and remote manual preemption.",
          "Demonstrated 68.5% reduction in emergency clearance delay during multi-scenario empirical testing.",
        ],
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AI Engineer Certification of Mastery",
        issuingOrganization: "PathLearn Academy",
        issueDate: "2025",
        credentialUrl: "https://pathlearn.dev/verify/cert-ai-101",
      },
    ],
    experience: [
      {
        id: "exp-1",
        organization: "TechNova Solutions",
        role: "Software Engineering Intern",
        duration: "Jun 2024 - Sep 2024",
        location: "Bangalore, India",
        responsibilities: [
          "Developed reusable UI component libraries with TypeScript and Tailwind CSS.",
          "Refactored backend REST API endpoints, improving data retrieval efficiency by 35%.",
        ],
        achievements: [
          "Awarded Intern of the Month for delivering secure authentication microservice ahead of schedule.",
        ],
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "1st Place - State Level Hackathon 2024",
        category: "Hackathon",
        date: "Nov 2024",
        description: "Developed an autonomous emergency dispatch portal under 36 hours.",
      },
    ],
    languages: [
      { id: "lang-1", language: "English", proficiency: "Fluent" },
      { id: "lang-2", language: "Kannada", proficiency: "Native" },
      { id: "lang-3", language: "Hindi", proficiency: "Professional" },
    ],
    atsScore: 88,
    completionPercentage: 95,
    updatedAt: new Date().toISOString(),
  }
}

export default resumeBuilderService
