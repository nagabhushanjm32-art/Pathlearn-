import { Router } from "express"
import multer from "multer"
import {
  uploadResumeHandler,
  analyzeResumeHandler,
  getCareerProfileHandler,
  updateTargetRoleHandler,
  getUserSkillsHandler,
  getSkillGapsHandler,
  getRecommendationsHandler,
  personalizeRoadmapHandler,
  getCareerReadinessHandler,
  improveResumeHandler,
  deleteResumeHandler,
} from "../controllers/careerController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

// Configure Multer for secure memory buffer storage (Max 10MB, PDF & DOCX only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = [".pdf", ".docx"]
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/octet-stream", // for some browser docx uploads
    ]

    const ext = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
    if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX documents are supported."))
    }
  },
})

// 1. Resume Upload & AI Analysis
router.post("/resume/upload", authenticate, upload.single("resume"), uploadResumeHandler)

// 2. Re-Analyze Existing Resume
router.post("/resume/analyze", authenticate, analyzeResumeHandler)

// 3. Career Profile Overview
router.get("/profile", authenticate, getCareerProfileHandler)

// 4. Update Target Role
router.put("/target-role", authenticate, updateTargetRoleHandler)

// 5. User Discovered Skills
router.get("/skills", authenticate, getUserSkillsHandler)

// 6. Skill Gap Analysis
router.get("/skill-gaps", authenticate, getSkillGapsHandler)

// 7. Career & Project Recommendations
router.post("/recommendations", authenticate, getRecommendationsHandler)

// 8. Personalize Learning Roadmap
router.post("/roadmap/personalize", authenticate, personalizeRoadmapHandler)

// 9. Career Readiness Score
router.get("/readiness", authenticate, getCareerReadinessHandler)

// 10. Improve Resume & ATS Optimization
router.post("/resume/improve", authenticate, improveResumeHandler)

// 11. Delete Resume Data
router.delete("/resume", authenticate, deleteResumeHandler)

export default router
