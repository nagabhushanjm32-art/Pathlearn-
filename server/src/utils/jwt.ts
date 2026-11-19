import jwt, { SignOptions } from "jsonwebtoken"
import { env } from "../config/env"

export interface JWTPayload {
  userId: string
  email: string
  role?: string
}

export function signToken(payload: JWTPayload, expiresIn?: string): string {
  const options: SignOptions = {
    expiresIn: (expiresIn || env.jwtExpiresIn || "7d") as any,
  }
  return jwt.sign(payload, env.jwtSecret, options)
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.jwtSecret) as JWTPayload
}
