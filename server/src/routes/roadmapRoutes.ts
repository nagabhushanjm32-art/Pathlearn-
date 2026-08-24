import { Router } from "express"
import { generateRoadmapForUser, getMyRoadmap } from "../controllers/roadmapController"
import { authenticate } from "../middleware/authenticate"

const router = Router()

router.post("/generate", authenticate, generateRoadmapForUser)
router.get("/:domainId", authenticate, getMyRoadmap)

export default router
