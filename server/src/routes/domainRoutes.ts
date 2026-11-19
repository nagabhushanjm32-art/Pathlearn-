import { Router } from "express"
import { getAllDomains, getDomainById } from "../controllers/domainController"
import { generateRoadmapForUser, getMyRoadmap } from "../controllers/roadmapController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

router.get("/", getAllDomains)
router.get("/:id", getDomainById)
router.post("/:id/generate-roadmap", authenticate, generateRoadmapForUser)
router.get("/:id/roadmap", authenticate, getMyRoadmap)

export default router
