import { Router } from "express"
import { completeOnboarding } from "../controllers/profileController"
import { getDashboardStats, getRecentActivity } from "../controllers/progressController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

router.patch("/onboarding", authenticate, completeOnboarding)
router.get("/stats", authenticate, getDashboardStats)
router.get("/activity", authenticate, getRecentActivity)

export default router
