import { Router } from "express"
import { getOrGenerateNotes } from "../controllers/notesController"
import { authenticate } from "../middleware/authenticate"

const router = Router()

router.get("/steps/:stepId", authenticate, getOrGenerateNotes)

export default router
