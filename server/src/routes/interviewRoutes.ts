import { Router } from "express"
import {
  createInterview,
  getInterview,
  startInterviewSession,
  submitAnswer,
  generateNextAdaptiveQuestion,
  completeInterview,
  getInterviewHistory,
  getInterviewResult,
  transcribeAudio,
} from "../controllers/interviewController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

// Session Lifecycle
router.post("/", authenticate, createInterview)
router.get("/history", authenticate, getInterviewHistory)
router.get("/:id", authenticate, getInterview)
router.get("/:id/result", authenticate, getInterviewResult)
router.post("/:id/start", authenticate, startInterviewSession)
router.post("/:id/answer", authenticate, submitAnswer)
router.post("/:id/next-question", authenticate, generateNextAdaptiveQuestion)
router.post("/:id/complete", authenticate, completeInterview)
router.post("/:id/transcribe-audio", authenticate, transcribeAudio)

// Legacy / alias routes
router.post("/start", authenticate, createInterview)
router.patch("/questions/:questionId/answer", authenticate, submitAnswer)

export default router
