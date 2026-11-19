import api from "./api"
import { StepNote } from "../types"

export async function fetchNotes(stepId: string): Promise<StepNote> {
  const res = await api.get(`/notes/steps/${stepId}`)
  const noteData = res.data?.note
  if (noteData?.content) {
    return {
      id: noteData.id,
      ...noteData.content,
    }
  }
  return noteData
}
