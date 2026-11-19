import { Request, Response, NextFunction } from "express"
import { verifyToken, JWTPayload } from "../utils/jwt"

export interface AuthRequest extends Request {
  user?: JWTPayload
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 1. Read JWT from HTTP-only cookie or Authorization header fallback
  const tokenFromCookie = req.cookies?.token
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined

  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    return res.status(401).json({
      authenticated: false,
      message: "Authentication required",
    })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      authenticated: false,
      message: "Invalid or expired session. Please log in again.",
    })
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const tokenFromCookie = req.cookies?.token
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined
  const token = tokenFromCookie || tokenFromHeader

  if (token) {
    try {
      const decoded = verifyToken(token)
      req.user = decoded
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

export const requireAuth = authMiddleware
export const authenticate = authMiddleware
export default authMiddleware
