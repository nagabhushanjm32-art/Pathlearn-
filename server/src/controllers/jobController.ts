import { Request, Response } from "express"
import jobService from "../services/jobService"
import { JobFilters } from "../types/jobTypes"

export async function getJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user
    const userId = user?.id || "guest-user"
    const userTargetRole = user?.profile?.targetRole || user?.targetRole || "Full Stack & AI Engineer"
    const userSkills = user?.skills || ["React", "TypeScript", "Node.js", "Python", "SQL", "PostgreSQL"]

    const filters: JobFilters = {
      search: req.query.search as string,
      category: req.query.category as string,
      workMode: req.query.workMode as string,
      jobType: req.query.jobType as string,
      roleType: req.query.roleType as any,
      location: req.query.location as string,
      experienceLevel: req.query.experienceLevel as string,
      sortBy: req.query.sortBy as "latest" | "salary" | "match"
    }

    const result = await jobService.getJobs(filters, userId, userTargetRole, userSkills)
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error("Error in getJobsHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch job openings."
    })
  }
}

export async function getJobByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string
    const user = (req as any).user
    const userId = user?.id || "guest-user"
    const userTargetRole = user?.profile?.targetRole || user?.targetRole || "Full Stack & AI Engineer"
    const userSkills = user?.skills || ["React", "TypeScript", "Node.js", "Python", "SQL", "PostgreSQL"]

    const job = await jobService.getJobById(id, userId, userTargetRole, userSkills)
    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job opening not found."
      })
      return
    }

    res.status(200).json({
      success: true,
      data: job
    })
  } catch (error: any) {
    console.error("Error in getJobByIdHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch job details."
    })
  }
}

export async function applyForJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string
    const user = (req as any).user
    const userId = user?.id || "guest-user"

    const applicationData = {
      ...req.body,
      candidateName: req.body.candidateName || user?.name || "Dr. Punith K R",
      candidateEmail: req.body.candidateEmail || user?.email || "punith@pathlearn.edu"
    }

    const application = await jobService.applyForJob(id, applicationData, userId)
    res.status(201).json({
      success: true,
      message: "Application successfully submitted!",
      data: application
    })
  } catch (error: any) {
    console.error("Error in applyForJobHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit job application."
    })
  }
}

export async function getUserApplicationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user
    const userId = user?.id || "guest-user"

    const applications = await jobService.getUserApplications(userId)
    res.status(200).json({
      success: true,
      data: applications
    })
  } catch (error: any) {
    console.error("Error in getUserApplicationsHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch applications."
    })
  }
}

export async function toggleSaveJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string
    const user = (req as any).user
    const userId = user?.id || "guest-user"

    const result = await jobService.toggleSaveJob(id, userId)
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error("Error in toggleSaveJobHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle bookmark."
    })
  }
}

export async function getUserSavedJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user
    const userId = user?.id || "guest-user"

    const savedJobs = await jobService.getUserSavedJobs(userId)
    res.status(200).json({
      success: true,
      data: savedJobs
    })
  } catch (error: any) {
    console.error("Error in getUserSavedJobsHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved jobs."
    })
  }
}

export async function generateCoverPitchHandler(req: Request, res: Response): Promise<void> {
  try {
    const { jobId, name, experience, skills, targetRole } = req.body
    if (!jobId) {
      res.status(400).json({
        success: false,
        message: "jobId is required."
      })
      return
    }

    const user = (req as any).user
    const candidateData = {
      name: name || user?.name || "Dr. Punith K R",
      experience: experience || "3-5 years in full-stack and AI software engineering",
      skills: skills || ["React", "TypeScript", "Node.js", "Python", "PyTorch", "PostgreSQL"],
      targetRole: targetRole || user?.profile?.targetRole || "Senior Software Engineer"
    }

    const pitch = await jobService.generateCoverPitch(jobId, candidateData)
    res.status(200).json({
      success: true,
      data: {
        pitch
      }
    })
  } catch (error: any) {
    console.error("Error in generateCoverPitchHandler:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate cover pitch."
    })
  }
}
