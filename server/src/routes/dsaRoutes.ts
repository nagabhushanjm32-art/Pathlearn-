import { Router } from "express"
import {
  getDsaProblems,
  getDsaProblemById,
  runDsaCode,
  submitDsaCode,
} from "../controllers/dsaController"
import { optionalAuth } from "../middleware/authMiddleware"

const router = Router()

router.get("/problems", optionalAuth, getDsaProblems)
router.get("/problems/:id", optionalAuth, getDsaProblemById)
router.post("/run", optionalAuth, runDsaCode)
router.post("/submit", optionalAuth, submitDsaCode)

export default router
