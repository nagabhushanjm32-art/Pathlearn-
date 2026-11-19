import React, { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Logo } from "../components/common/Logo"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff, Check, ArrowRight, Sparkles, Shield, Cpu, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = (location.state as any)?.from?.pathname || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError("Please fill in all fields.")
      return
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const res = await login(cleanEmail, password)
      if (res.success) {
        navigate(from, { replace: true })
      } else {
        setError(res.error || "Invalid email or password.")
      }
    } catch {
      setError("Failed to sign in. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { title: "AI-Curated Learning Paths", desc: "Adaptive roadmaps aligned with real industry job roles." },
    { title: "Smart Notes & Quizzes", desc: "Instant AI summaries, key takeaways, and knowledge tests." },
    { title: "AI Mock Interviews", desc: "Real-time voice & text technical interviews with instant feedback." },
    { title: "Verifiable Certificates", desc: "Cryptographically tamper-proof certificates with QR codes." },
    { title: "Track & Improve", desc: "Deep analytics on skill mastery and interview readiness." },
  ]

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* LEFT COLUMN: Premium AI SaaS Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-indigo-950 via-slate-950 to-purple-950 p-12 flex-col justify-between overflow-hidden border-r border-border/40">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Logo size="lg" linkTo="" />
        </div>

        {/* Hero Narrative & Features */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Engineering Career Readiness</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Learning Paths <br />
              <span className="bg-linear-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                For Your Future.
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Personalized roadmaps, smart notes, mock interviews & verifiable certificates — all in one unified engineering platform.
            </p>
          </motion.div>

          {/* Feature Checklist */}
          <div className="space-y-3.5 pt-2">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">{feat.title}</span>
                  <p className="text-[11px] text-slate-400">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 3D Concept Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <Cpu className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-200">Adaptive AI</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <Shield className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-200">Verifiable</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-200">Job-Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline Quote */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <p className="text-xs font-serif italic text-slate-400 tracking-wide">
            "Learn smarter. Practice deeply. Get Certified. Get Hired."
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Split-Screen Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex justify-center mb-4">
            <Logo size="md" />
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back! 👋
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Login to continue your personalized learning roadmap.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter an email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-foreground placeholder:text-muted-foreground/60 transition-all shadow-xs"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("To reset your password, please contact the administrator.")
                  }}
                  className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-foreground placeholder:text-muted-foreground/60 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember me on this browser
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-2.5 text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-indigo-500 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Footer Security Badge */}
          <div className="text-center pt-2">
            <span className="text-[10px] text-muted-foreground/70 inline-flex items-center gap-1">
              <Shield className="w-3 h-3 text-indigo-500" />
              Secured by PathLearn HTTP-only Auth
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
