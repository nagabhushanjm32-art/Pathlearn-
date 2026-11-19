import { Router } from "express"
import {
  getJobsHandler,
  getJobByIdHandler,
  applyForJobHandler,
  getUserApplicationsHandler,
  toggleSaveJobHandler,
  getUserSavedJobsHandler,
  generateCoverPitchHandler,
} from "../controllers/jobController"
import { optionalAuth } from "../middleware/authMiddleware"

const router = Router()

// Job listings & search
router.get("/", optionalAuth, getJobsHandler)
router.get("/applications", optionalAuth, getUserApplicationsHandler)
router.get("/saved", optionalAuth, getUserSavedJobsHandler)
router.post("/generate-pitch", optionalAuth, generateCoverPitchHandler)

// Individual job operations
router.get("/:id", optionalAuth, getJobByIdHandler)
router.post("/:id/apply", optionalAuth, applyForJobHandler)
router.post("/:id/save", optionalAuth, toggleSaveJobHandler)

export default router
