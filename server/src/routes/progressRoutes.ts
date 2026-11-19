import { Router } from "express"
import {
  trackWatchProgress,
  markStepComplete,
  getDashboardStats,
  getRecentActivity,
  getCertificateEligibility,
  getDomainProgress,
} from "../controllers/progressController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

router.post("/:stepId/watch", authenticate, trackWatchProgress)
router.post("/:stepId/complete", authenticate, markStepComplete)
router.get("/dashboard/stats", authenticate, getDashboardStats)
router.get("/dashboard/activity", authenticate, getRecentActivity)
router.get("/certificates/:domainId/eligibility", authenticate, getCertificateEligibility)
router.get("/:domainId", authenticate, getDomainProgress)

export default router
