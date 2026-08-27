import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes"
import profileRoutes from "./routes/profileRoutes"
import domainRoutes from "./routes/domainRoutes"
import roadmapRoutes from "./routes/roadmapRoutes"
import quizRoutes from "./routes/quizRoutes"
import notesRoutes from "./routes/notesRoutes"

dotenv.config()

const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "PathLearn server running" })
})

app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/domains", domainRoutes)
app.use("/api/roadmaps", roadmapRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/notes", notesRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
