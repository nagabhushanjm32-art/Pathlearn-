import { Router } from "express"
import {
  generateRoadmapForUser,
  getMyRoadmap,
  getStepById,
} from "../controllers/roadmapController"
import { markStepComplete } from "../controllers/progressController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

router.post("/generate", authenticate, generateRoadmapForUser)
router.get("/steps/:stepId", authenticate, getStepById)
router.get("/:domainId", authenticate, getMyRoadmap)
router.patch("/steps/:stepId/complete", authenticate, markStepComplete)

export default router
