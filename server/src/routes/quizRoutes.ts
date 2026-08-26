import { Router } from "express"
import { generateQuizForStep, submitQuizAttempt } from "../controllers/quizController"
import { authenticate } from "../middleware/authenticate"

const router = Router()

router.post("/steps/:stepId/generate", authenticate, generateQuizForStep)
router.post("/:quizId/submit", authenticate, submitQuizAttempt)

export default router
