import { Router } from "express"
import {
  getOrGenerateQuizForStep,
  submitQuizAttempt,
} from "../controllers/quizController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

router.get("/steps/:stepId", authenticate, getOrGenerateQuizForStep)
router.get("/:stepId", authenticate, getOrGenerateQuizForStep)
router.post("/steps/:stepId/generate", authenticate, getOrGenerateQuizForStep)
router.post("/:quizId/submit", authenticate, submitQuizAttempt)
router.post("/:quizId/attempt", authenticate, submitQuizAttempt)

export default router
