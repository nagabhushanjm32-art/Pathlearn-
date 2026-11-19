import api from "./api"
import {
  CareerProfileData,
  ResumeStatus,
  UserSkillItem,
  SkillGapItem,
  ProjectRecommendation,
  ResumeImprovementData,
  ReadinessBreakdown,
} from "../types"

export const careerService = {
  /**
   * Upload and analyze a new resume file (PDF or DOCX, max 10MB)
   */
  async uploadResume(file: File): Promise<{
    message: string
    resumeAnalysis: any
    readiness: { score: number; breakdown: ReadinessBreakdown }
    targetRole: string
  }> {
    const formData = new FormData()
    formData.append("resume", file)

    const res = await api.post("/career/resume/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data
  },

  /**
   * Re-analyze currently uploaded resume
   */
  async reanalyzeResume(): Promise<any> {
    const res = await api.post("/career/resume/analyze")
    return res.data
  },

  /**
   * Fetch full career profile overview, stats, and readiness
   */
  async getCareerProfile(): Promise<{
    careerProfile: CareerProfileData
    resumeStatus: ResumeStatus
    skills: UserSkillItem[]
    stats: {
      skillsCount: number
      certificatesCount: number
      interviewScore: number
      interviewPassed: boolean
    }
    gaps: SkillGapItem[]
  }> {
    const res = await api.get("/career/profile")
    return res.data
  },

  /**
   * Update target role and re-benchmarks skill gaps
   */
  async updateTargetRole(targetRole: string): Promise<{
    message: string
    targetRole: string
    readiness: { score: number; breakdown: ReadinessBreakdown }
    skillGaps: SkillGapItem[]
  }> {
    const res = await api.put("/career/target-role", { targetRole })
    return res.data
  },

  /**
   * Get all extracted user skills
   */
  async getUserSkills(): Promise<{ skills: UserSkillItem[] }> {
    const res = await api.get("/career/skills")
    return res.data
  },

  /**
   * Get skill gaps for current or queried target role
   */
  async getSkillGaps(targetRole?: string): Promise<{
    targetRole: string
    skillGaps: SkillGapItem[]
  }> {
    const res = await api.get("/career/skill-gaps", {
      params: targetRole ? { targetRole } : undefined,
    })
    return res.data
  },

  /**
   * Get project recommendations and priority skill gaps
   */
  async getRecommendations(): Promise<{
    targetRole: string
    projects: ProjectRecommendation[]
    prioritySkills: string[]
    weakGaps: SkillGapItem[]
  }> {
    const res = await api.post("/career/recommendations")
    return res.data
  },

  /**
   * Personalize roadmap priority ordering
   */
  async personalizeRoadmap(targetRole?: string): Promise<{
    success: boolean
    message: string
    prioritizedSkills: string[]
    targetRole?: string
  }> {
    const res = await api.post("/career/roadmap/personalize", { targetRole })
    return res.data
  },

  /**
   * Get transparent career readiness score and factor explanation
   */
  async getCareerReadiness(): Promise<{
    targetRole: string
    readinessScore: number
    breakdown: ReadinessBreakdown
  }> {
    const res = await api.get("/career/readiness")
    return res.data
  },

  /**
   * Get ATS keyword analysis, section checklist, and project impact advice
   */
  async improveResume(): Promise<ResumeImprovementData> {
    const res = await api.post("/career/resume/improve")
    return res.data
  },

  /**
   * Delete uploaded resume and reset extracted skills
   */
  async deleteResume(): Promise<any> {
    const res = await api.delete("/career/resume")
    return res.data
  },
}

export default careerService
