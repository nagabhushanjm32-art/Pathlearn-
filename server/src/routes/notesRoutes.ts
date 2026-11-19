import { Router } from "express"
import { getOrGenerateNotes } from "../controllers/notesController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

router.get("/steps/:stepId", authenticate, getOrGenerateNotes)
router.get("/:stepId", authenticate, getOrGenerateNotes)

export default router
