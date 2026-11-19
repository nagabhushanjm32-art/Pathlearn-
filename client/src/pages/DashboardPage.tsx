import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Play,
  Compass,
  Clock,
  Flame,
  Zap,
} from "lucide-react"
import { StatCard } from "../components/dashboard/StatCard"
import { OverallProgressCard } from "../components/dashboard/OverallProgressCard"
import { RecentActivity } from "../components/dashboard/RecentActivity"
import { DomainCard } from "../components/domains/DomainCard"
import { DailyStreakTracker } from "../components/dashboard/DailyStreakTracker"
import { DailyAiDrillCard } from "../components/dashboard/DailyAiDrillCard"
import { FocusTimerWidget } from "../components/dashboard/FocusTimerWidget"
import { QuickActionsCard } from "../components/dashboard/QuickActionsCard"
import { WeeklyActivityHeatmap } from "../components/dashboard/WeeklyActivityHeatmap"
import { useAuth } from "../context/AuthContext"
import { progressService } from "../services/progressService"
import { domainService } from "../services/domainService"
import { DashboardStats, ActivityItem, Domain } from "../types"
import { Button } from "@/components/ui/button"
import { getTimeGreeting, formatDisplayName } from "../lib/greeting"

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Keep time updated
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, actData, domData] = await Promise.all([
          progressService.getDashboardStats(),
          progressService.getRecentActivity(),
          domainService.getDomains(),
        ])
        setStats(statsData)
        setActivities(actData)
        setDomains(domData)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  // Dynamic time-based greeting calculation
  const timeInfo = getTimeGreeting(currentTime)
  const displayName = formatDisplayName(user?.name)
  const activeStep = stats?.activeStep

  const formattedTimeString = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
  const formattedDateString = currentTime.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Greeting & Dynamic Time Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-linear-to-r from-card via-card to-indigo-950/10 border border-border/80 shadow-xs relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${timeInfo.colorTheme.badgeBg} ${timeInfo.colorTheme.badgeText}`}
            >
              <span>{timeInfo.emoji}</span>
              <span>{timeInfo.subBadge}</span>
            </span>
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground/80" />
              <span>{formattedDateString} • {formattedTimeString}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2 pt-1">
            {timeInfo.greeting}, {displayName}! {timeInfo.emoji}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {stats && stats.lessonsCompleted > 0
              ? timeInfo.quote
              : "Welcome to PathLearn! Choose an engineering domain track below and start your mastery journey today."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0 self-start md:self-center">
          <Button
            onClick={() => navigate("/domains")}
            variant="outline"
            className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted cursor-pointer"
          >
            Explore Domains
          </Button>

          <Button
            onClick={() => navigate("/domains/ai-engineer")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Engineer Track
          </Button>
        </div>
      </div>

      {/* 2. Top Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Lessons Completed"
          value={stats?.lessonsCompleted ?? 0}
          icon={BookOpen}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-500/10"
          trend={stats && stats.lessonsCompleted > 0 ? `${stats.lessonsCompleted} total` : "Start 1st lesson"}
        />
        <StatCard
          label="Quizzes Passed"
          value={stats?.quizzesPassed ?? 0}
          icon={CheckCircle}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
          trend={stats && stats.quizzesPassed > 0 ? "Verified" : "Passing score ≥60%"}
        />
        <StatCard
          label="Overall Progress"
          value={`${stats?.overallProgress ?? 0}%`}
          icon={TrendingUp}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          trend={stats && stats.overallProgress > 0 ? `${stats.overallProgress}% complete` : "0% initially"}
        />
        <StatCard
          label="Certificates Earned"
          value={stats?.certificatesEarned ?? 0}
          icon={Award}
          colorClass="text-purple-500"
          bgClass="bg-purple-500/10"
          trend="Verifiable"
        />
      </div>

      {/* 3. Continue Learning Hero Section */}
      {activeStep ? (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-indigo-950/40 via-card to-purple-950/30 border border-indigo-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Play className="w-6 h-6 fill-white" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Continue Learning • {activeStep.domainName}
                  </span>
                  <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    Step {String(activeStep.stepOrder).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {activeStep.stepTitle}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activeStep.videoProgress > 0
                    ? `${activeStep.videoProgress}% watched • Pick up right where you left off`
                    : activeStep.stepDescription}
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/learn/${activeStep.stepId}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 py-2.5 shadow-xs gap-2 shrink-0 self-stretch sm:self-center cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Start your first learning path
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Explore engineering tracks in AI, Machine Learning, Data Science, Web Development, and more. Progress begins as you watch videos and complete steps.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/domains")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-5 py-2 shadow-xs shrink-0 self-stretch sm:self-center cursor-pointer"
          >
            Explore Domains
          </Button>
        </div>
      )}

      {/* 4. Interactive Gamification & Accelerators Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Study Streak Tracker */}
        <DailyStreakTracker
          initialStreak={stats?.streakDays || 3}
          completedLessons={stats?.lessonsCompleted || 0}
          passedQuizzes={stats?.quizzesPassed || 0}
        />

        {/* AI Daily Rapid Drill */}
        <DailyAiDrillCard />

        {/* Pomodoro Focus Timer */}
        <FocusTimerWidget />
      </div>

      {/* 5. Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* LEFT COLUMN (2 Cols): Overall Progress + Quick Actions + Explore Domains */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card */}
          <OverallProgressCard
            progress={stats?.overallProgress ?? 0}
            completedSteps={stats?.completedSteps ?? 0}
            totalSteps={stats?.totalSteps ?? (domains.length * 10)}
          />

          {/* Quick Actions Hub */}
          <QuickActionsCard />

          {/* Explore Domains Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">Explore Domains</h2>
                <p className="text-xs text-muted-foreground">Pick up where you left off or start a new skill track.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/domains")}
                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  aria-label="Previous domain page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/domains")}
                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  aria-label="Next domain page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {domains.slice(0, 4).map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): Weekly Heatmap + Recent Activity + AI Career Readiness Card */}
        <div className="space-y-6">
          {/* Weekly Heatmap Activity */}
          <WeeklyActivityHeatmap />

          {/* Recent Activity */}
          <RecentActivity activities={activities} />

          {/* AI Career Readiness Card */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-950/30 via-card to-purple-950/20 border border-indigo-500/30 shadow-xs relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Career Readiness</span>
              </div>
              <span className="text-sm font-black text-indigo-400 font-mono">
                {stats?.overallProgress ? `${Math.min(95, Math.max(50, stats.overallProgress))}%` : "72%"}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Target Role: {user?.targetRole || "AI / ML Engineer"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Benchmark your skills against industry standards, identify critical gaps, and accelerate interview readiness.
              </p>
            </div>

            {/* Top Gap & Recommendation Pills */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Top Skill Gap</span>
                <span className="font-bold text-amber-400">PyTorch & Transformers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Recommended Next</span>
                <span className="font-medium text-foreground">Deep Learning & LLMs</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                onClick={() => navigate("/career-profile")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold gap-2 shadow-xs cursor-pointer"
              >
                <span>View Career Insights</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Button>

              <Button
                onClick={() => navigate("/domains/ai-engineer")}
                variant="outline"
                className="w-full rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted cursor-pointer"
              >
                <span>Continue Learning</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
