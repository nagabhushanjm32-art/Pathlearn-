import { Request, Response, NextFunction } from "express"
import { env } from "../config/env"

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found on PathLearn API server",
  })
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  // Log error in non-test environments
  if (env.nodeEnv !== "test") {
    console.error("PathLearn API Error:", {
      statusCode,
      message,
      stack: env.nodeEnv === "development" ? err.stack : undefined,
    })
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(env.nodeEnv === "development" && { stack: err.stack }),
  })
}
