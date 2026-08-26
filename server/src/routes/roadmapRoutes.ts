import { Router } from "express"
import { generateRoadmapForUser, getMyRoadmap } from "../controllers/roadmapController"
import { completeStep } from "../controllers/roadmapStepController"
import { authenticate } from "../middleware/authenticate"

const router = Router()

router.post("/generate", authenticate, generateRoadmapForUser)
router.get("/:domainId", authenticate, getMyRoadmap)
router.patch("/steps/:stepId/complete", authenticate, completeStep)

export default router
