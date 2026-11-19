import api from "./api"
import { DashboardStats, ActivityItem, CertificateEligibility } from "../types"

export const defaultZeroStats: DashboardStats = {
  lessonsCompleted: 0,
  quizzesPassed: 0,
  overallProgress: 0,
  certificatesEarned: 0,
  totalSteps: 0,
  completedSteps: 0,
  streakDays: 0,
  activeStep: null,
}

export const progressService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await api.get("/progress/dashboard/stats")
      return res.data.stats || defaultZeroStats
    } catch {
      try {
        const res = await api.get("/profile/stats")
        return res.data.stats || defaultZeroStats
      } catch {
        return defaultZeroStats
      }
    }
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      const res = await api.get("/progress/dashboard/activity")
      return res.data.activities || []
    } catch {
      try {
        const res = await api.get("/profile/activity")
        return res.data.activities || []
      } catch {
        return []
      }
    }
  },

  async trackWatchProgress(stepId: string, progress: number): Promise<{ videoCompleted: boolean; stepCompleted: boolean }> {
    const res = await api.post(`/progress/${stepId}/watch`, { progress })
    return res.data
  },

  async markStepComplete(stepId: string): Promise<any> {
    const res = await api.post(`/progress/${stepId}/complete`)
    return res.data
  },

  async getCertificateEligibility(domainId: string): Promise<CertificateEligibility> {
    const res = await api.get(`/progress/certificates/${domainId}/eligibility`)
    return res.data.eligibility
  },
}
