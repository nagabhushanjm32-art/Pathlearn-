import express, { Request, Response } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { env } from "./config/env"
import { checkDatabaseConnection } from "./config/database"
import authRoutes from "./routes/authRoutes"
import profileRoutes from "./routes/profileRoutes"
import domainRoutes from "./routes/domainRoutes"
import roadmapRoutes from "./routes/roadmapRoutes"
import progressRoutes from "./routes/progressRoutes"
import quizRoutes from "./routes/quizRoutes"
import notesRoutes from "./routes/notesRoutes"
import interviewRoutes from "./routes/interviewRoutes"
import certificateRoutes from "./routes/certificateRoutes"
import careerRoutes from "./routes/careerRoutes"
import chatRoutes from "./routes/chatRoutes"
import dsaRoutes from "./routes/dsaRoutes"
import researchPaperRoutes from "./routes/researchPaperRoutes"
import resumeBuilderRoutes from "./routes/resumeBuilderRoutes"
import jobRoutes from "./routes/jobRoutes"
import { getStepById, getStepResources } from "./controllers/roadmapController"
import { getOrGenerateNotes } from "./controllers/notesController"
import { getDashboardStats, getCertificateEligibility } from "./controllers/progressController"
import { authenticate } from "./middleware/authMiddleware"
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware"

const app = express()

// 1. Security & Core Middleware
app.use(helmet())
app.use(
  cors({
    origin: env.clientUrl || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)
app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"))
}

// 2. Health Endpoint
app.get("/api/health", async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection()
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "ok" : "degraded",
    service: "PathLearn API Server",
    database: dbHealthy ? "connected" : "disconnected",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  })
})

// 3. Application Routes
app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/domains", domainRoutes)
app.use("/api/roadmaps", roadmapRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/quizzes", quizRoutes)
app.use("/api/notes", notesRoutes)
app.use("/api/interview", interviewRoutes)
app.use("/api/interviews", interviewRoutes)
app.use("/api/certificates", certificateRoutes)
app.use("/api/career", careerRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/ai/chat", chatRoutes)
app.use("/api/dsa", dsaRoutes)
app.use("/api/research-paper", researchPaperRoutes)
app.use("/api/resume-builder", resumeBuilderRoutes)
app.use("/api/jobs", jobRoutes)

// Top-level aliases strictly adhering to Section 19 API specs
app.get("/api/steps/:stepId", authenticate, getStepById)
app.get("/api/steps/:stepId/resources", authenticate, getStepResources)
app.get("/api/steps/:stepId/notes", authenticate, getOrGenerateNotes)
app.get("/api/dashboard", authenticate, getDashboardStats)
app.get("/api/certificates/:domainId/eligibility", authenticate, getCertificateEligibility)

// 4. 404 and Global Error Handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
