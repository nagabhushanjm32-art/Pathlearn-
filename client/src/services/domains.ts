import api from "./api"

export interface Domain {
  id: string
  name: string
  slug: string
  description: string
  icon: string | null
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  estimatedDays: number
  skillTags: string[]
}

export async function fetchDomains(): Promise<Domain[]> {
  const res = await api.get("/domains")
  return res.data.domains
}
