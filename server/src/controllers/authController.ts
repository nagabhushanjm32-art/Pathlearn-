import { Request, Response, NextFunction } from "express"
import { authService } from "../services/authService"
import { env } from "../config/env"
import { AuthRequest } from "../middleware/authMiddleware"

const AUTH_COOKIE_NAME = "token"

/**
 * Cookie options tailored for security in production and local development
 */
export function getAuthCookieOptions() {
  const isProduction = env.nodeEnv === "production"
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  }
}

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body
    const { user, token } = await authService.register({ name, email, password })

    // Set secure HTTP-only cookie with JWT
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

    return res.status(201).json({
      message: "Account created successfully",
      user,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body
    const { user, token } = await authService.login({ email, password })

    // Set secure HTTP-only cookie with JWT
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

    return res.status(200).json({
      message: "Logged in successfully",
      user,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(_req: Request, res: Response, next: NextFunction) {
  try {
    const isProduction = env.nodeEnv === "production"
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })

    return res.status(200).json({
      message: "Logged out successfully",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({
        authenticated: false,
        message: "Authentication required",
      })
    }

    const user = await authService.getCurrentUser(userId)

    return res.status(200).json({
      authenticated: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}
