import dotenv from "dotenv"

dotenv.config()

export interface EnvConfig {
  port: number
  nodeEnv: "development" | "production" | "test"
  clientUrl: string
  databaseUrl: string
  jwtSecret: string
  jwtExpiresIn: string
  anthropicApiKey: string
  geminiApiKey: string
  youtubeApiKey: string
}

export const env: EnvConfig = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "pathlearn_jwt_secret_dev_key_super_secure_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
}
