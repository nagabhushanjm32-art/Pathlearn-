import { Router } from "express"
import {
  generateResearchPaper,
  scanPaperPlagiarism,
  refinePaperSection,
} from "../controllers/researchPaperController"
import { optionalAuth } from "../middleware/authMiddleware"

const router = Router()

router.post("/generate", optionalAuth, generateResearchPaper)
router.post("/scan-plagiarism", optionalAuth, scanPaperPlagiarism)
router.post("/refine", optionalAuth, refinePaperSection)

export default router
