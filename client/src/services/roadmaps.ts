import api from "./api"

export interface RoadmapStep {
  id: string
  order: number
  title: string
  description: string
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  estimatedMinutes: number
  prerequisites: string[]
  learningObjectives: string[]
  skillsGained: string[]
  interviewRelevance: string | null
  isLocked: boolean
  isCompleted: boolean
}

export interface Roadmap {
  id: string
  domainId: string
  progress: number
  steps: RoadmapStep[]
}

export async function generateRoadmap(domainId: string): Promise<Roadmap> {
  const res = await api.post("/roadmaps/generate", { domainId })
  return res.data.roadmap
}

export async function fetchRoadmap(domainId: string): Promise<Roadmap | null> {
  try {
    const res = await api.get(`/roadmaps/${domainId}`)
    return res.data.roadmap
  } catch (err: any) {
    if (err.response?.status === 404) return null
    throw err
  }
}

export async function completeStep(stepId: string): Promise<Roadmap> {
  const res = await api.patch(`/roadmaps/steps/${stepId}/complete`)
  return res.data.roadmap
}
