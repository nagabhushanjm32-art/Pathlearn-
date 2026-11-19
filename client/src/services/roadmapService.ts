import api from "./api"
import { Roadmap, StepDetail } from "../types"

export const roadmapService = {
  async getRoadmap(domainSlug: string): Promise<Roadmap | undefined> {
    try {
      const res = await api.get(`/roadmaps/${domainSlug}`)
      return res.data.roadmap
    } catch (err: any) {
      console.error("Failed to load roadmap from API:", err)
      throw err
    }
  },

  async generateRoadmap(domainSlug: string): Promise<Roadmap> {
    const res = await api.post("/roadmaps/generate", { domainId: domainSlug })
    return res.data.roadmap
  },

  async getStepDetails(stepId: string): Promise<StepDetail> {
    const res = await api.get(`/steps/${stepId}`)
    return res.data.step
  },

  async toggleStepCompletion(_domainSlug: string, stepId: string, _completed: boolean): Promise<any> {
    const res = await api.post(`/progress/${stepId}/complete`)
    return res.data
  },
}
