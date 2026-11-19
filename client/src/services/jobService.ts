import api from "./api"
import { JobOpening, JobApplication, JobFilters, JobsResponse } from "../types/job"

export const jobService = {
  /**
   * Fetch latest job openings with filtering and search
   */
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.category && filters.category !== "All") params.append("category", filters.category)
    if (filters.workMode && filters.workMode !== "All") params.append("workMode", filters.workMode)
    if (filters.jobType && filters.jobType !== "All") params.append("jobType", filters.jobType)
    if (filters.roleType && filters.roleType !== "All") params.append("roleType", filters.roleType)
    if (filters.location && filters.location !== "All") params.append("location", filters.location)
    if (filters.experienceLevel && filters.experienceLevel !== "All") params.append("experienceLevel", filters.experienceLevel)
    if (filters.sortBy) params.append("sortBy", filters.sortBy)

    const response = await api.get<{ success: boolean; data: JobsResponse }>(`/jobs?${params.toString()}`)
    return response.data.data
  },

  /**
   * Fetch specific job opening details
   */
  async getJobById(jobId: string): Promise<JobOpening> {
    const response = await api.get<{ success: boolean; data: JobOpening }>(`/jobs/${jobId}`)
    return response.data.data
  },

  /**
   * Submit job application
   */
  async applyForJob(jobId: string, applicationData: Partial<JobApplication>): Promise<JobApplication> {
    const response = await api.post<{ success: boolean; message: string; data: JobApplication }>(
      `/jobs/${jobId}/apply`,
      applicationData
    )
    return response.data.data
  },

  /**
   * Fetch applications submitted by user
   */
  async getMyApplications(): Promise<JobApplication[]> {
    const response = await api.get<{ success: boolean; data: JobApplication[] }>("/jobs/applications")
    return response.data.data
  },

  /**
   * Toggle save/bookmark job
   */
  async toggleSaveJob(jobId: string): Promise<{ isSaved: boolean }> {
    const response = await api.post<{ success: boolean; data: { isSaved: boolean } }>(`/jobs/${jobId}/save`)
    return response.data.data
  },

  /**
   * Fetch saved jobs
   */
  async getSavedJobs(): Promise<JobOpening[]> {
    const response = await api.get<{ success: boolean; data: JobOpening[] }>("/jobs/saved")
    return response.data.data
  },

  /**
   * Generate tailored cover pitch using AI
   */
  async generateCoverPitch(params: {
    jobId: string
    name?: string
    experience?: string
    skills?: string[]
    targetRole?: string
  }): Promise<string> {
    const response = await api.post<{ success: boolean; data: { pitch: string } }>("/jobs/generate-pitch", params)
    return response.data.data.pitch
  }
}

export default jobService
