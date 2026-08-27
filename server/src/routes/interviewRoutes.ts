import { Router } from "express"
import {
  startInterview,
  getInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
} from "../controllers/interviewController"
import { authenticate } from "../middleware/authenticate"

const router = Router()

router.post("/start", authenticate, startInterview)
router.get("/history", authenticate, getInterviewHistory)
router.get("/:interviewId", authenticate, getInterview)
router.patch("/questions/:questionId/answer", authenticate, submitAnswer)
router.post("/:interviewId/complete", authenticate, completeInterview)

export default router
