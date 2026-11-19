import { Router } from "express"
import { register, login, logout, getMe } from "../controllers/authController"
import { requireAuth } from "../middleware/authMiddleware"
import { validate } from "../middleware/validationMiddleware"
import { registerSchema, loginSchema } from "../validators/authValidators"
import { authRateLimiter } from "../middleware/rateLimitMiddleware"

const router = Router()

// Registration with rate limiting & Zod input validation
router.post("/register", authRateLimiter, validate(registerSchema), register)

// Login with rate limiting & Zod input validation
router.post("/login", authRateLimiter, validate(loginSchema), login)

// Logout endpoint to clear HTTP-only cookie
router.post("/logout", logout)

// Authenticated session check endpoint
router.get("/me", requireAuth, getMe)

export default router
