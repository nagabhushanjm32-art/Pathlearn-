import api from "./api"

export interface NoteContent {
  summary: string
  keyConcepts: string[]
  definitions: { term: string; definition: string }[]
  examples: string[]
  commonMistakes: string[]
  interviewTips: string[]
  quickRevision: string[]
  takeaways: string[]
}

export interface Note {
  id: string
  content: NoteContent
}

export async function fetchNotes(stepId: string): Promise<Note> {
  const res = await api.get(`/notes/steps/${stepId}`)
  return res.data.note
}
