import { Router } from "express"
import {
  getResumesHandler,
  getResumeByIdHandler,
  saveResumeHandler,
  duplicateResumeHandler,
  deleteResumeHandler,
  generateSummaryHandler,
  improveBulletHandler,
  optimizeForJobHandler,
  auditResumeHandler,
  importPlatformDataHandler,
} from "../controllers/resumeBuilderController"
import { optionalAuth } from "../middleware/authMiddleware"

const router = Router()

router.get("/resumes", optionalAuth, getResumesHandler)
router.get("/resumes/:id", optionalAuth, getResumeByIdHandler)
router.post("/resumes/save", optionalAuth, saveResumeHandler)
router.post("/resumes/:id/duplicate", optionalAuth, duplicateResumeHandler)
router.delete("/resumes/:id", optionalAuth, deleteResumeHandler)

router.post("/ai/generate-summary", optionalAuth, generateSummaryHandler)
router.post("/ai/improve-bullet", optionalAuth, improveBulletHandler)
router.post("/ai/optimize-job", optionalAuth, optimizeForJobHandler)
router.post("/ai/audit", optionalAuth, auditResumeHandler)
router.get("/platform/import", optionalAuth, importPlatformDataHandler)

export default router
