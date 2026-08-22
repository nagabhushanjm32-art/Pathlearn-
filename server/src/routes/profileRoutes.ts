import { Router } from "express"
import { completeOnboarding } from "../controllers/profileController"
import { authenticate } from "../middleware/authenticate"

const router = Router()

router.patch("/onboarding", authenticate, completeOnboarding)

export default router
