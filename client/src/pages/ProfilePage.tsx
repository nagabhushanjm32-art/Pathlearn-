import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UserAvatar } from "../components/common/UserAvatar"
import { useAuth } from "../context/AuthContext"
import { progressService } from "../services/progressService"
import { DashboardStats } from "../types"
import {
  Award,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Mail,
  Briefcase,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await progressService.getDashboardStats()
        setStats(statsData)
      } catch (err) {
        console.error("Failed to load profile stats:", err)
      }
    }
    loadStats()
  }, [])

  const skills = [
    { name: "Python 3 & OOP", level: stats && stats.lessonsCompleted > 0 ? 70 : 0 },
    { name: "Machine Learning Foundations", level: stats && stats.lessonsCompleted > 2 ? 60 : 0 },
    { name: "Data Manipulation (NumPy / Pandas)", level: stats && stats.lessonsCompleted > 1 ? 55 : 0 },
    { name: "Deep Learning & Neural Networks", level: stats && stats.lessonsCompleted > 4 ? 40 : 0 },
    { name: "SQL & Query Optimization", level: stats && stats.lessonsCompleted > 0 ? 50 : 0 },
    { name: "Model Deployment & FastAPI", level: stats && stats.lessonsCompleted > 5 ? 30 : 0 }
  ]

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "January 2026"

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Profile Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <UserAvatar
          name={user?.name || "Student"}
          avatarUrl={user?.avatarUrl}
          size="xl"
          showOnlineStatus
          className="ring-4 ring-indigo-500/20"
        />

        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {user?.name || "Student"}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-500 font-semibold mt-0.5">
                {user?.targetRole || "AI / Software Engineer Track"}
              </p>
            </div>

            <Button
              onClick={() => navigate("/settings")}
              variant="outline"
              className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted"
            >
              Edit Profile
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              {user?.email || "student@pathlearn.io"}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              Candidate
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Joined {joinDate}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row - STRICT REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/80 text-center space-y-1">
          <BookOpen className="w-5 h-5 text-indigo-500 mx-auto" />
          <div className="text-xl font-bold text-foreground">{stats?.lessonsCompleted ?? 0}</div>
          <p className="text-[11px] text-muted-foreground">Lessons Completed</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/80 text-center space-y-1">
          <CheckCircle className="w-5 h-5 text-amber-500 mx-auto" />
          <div className="text-xl font-bold text-foreground">{stats?.quizzesPassed ?? 0}</div>
          <p className="text-[11px] text-muted-foreground">Quizzes Passed</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/80 text-center space-y-1">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto" />
          <div className="text-xl font-bold text-foreground">{stats?.overallProgress ?? 0}%</div>
          <p className="text-[11px] text-muted-foreground">Overall Completion</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/80 text-center space-y-1">
          <Award className="w-5 h-5 text-purple-500 mx-auto" />
          <div className="text-xl font-bold text-foreground">{stats?.certificatesEarned ?? 0}</div>
          <p className="text-[11px] text-muted-foreground">Certificates Earned</p>
        </div>
      </div>

      {/* Skills Matrix & Earned Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Matrix */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Verified Skill Mastery
          </h2>

          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earned Certificates Card */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Earned Certificates
          </h2>

          {stats && stats.certificatesEarned > 0 ? (
            <div className="space-y-3.5">
              {/* If user earned certificates */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-foreground">AI Engineer Track</h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Verified Credential</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/certificate/ai-engineer")}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold text-foreground">No Certificates Earned Yet</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Certificates unlock upon 100% roadmap completion, passed quizzes, and AI mock interview readiness.
              </p>
              <Button
                onClick={() => navigate("/domains")}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs mt-2"
              >
                Start Learning
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
