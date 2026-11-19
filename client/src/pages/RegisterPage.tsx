import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Logo } from "../components/common/Logo"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff, Check, ArrowRight, Sparkles, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError("Please fill in all required fields.")
      return
    }

    if (cleanName.length < 2) {
      setError("Name must contain at least 2 characters.")
      return
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!agreeTerms) {
      setError("You must accept the Terms & Conditions to proceed.")
      return
    }

    setLoading(true)
    try {
      const res = await register(cleanName, cleanEmail, password, confirmPassword)
      if (res.success) {
        navigate("/dashboard")
      } else {
        setError(res.error || "Failed to create account.")
      }
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* LEFT COLUMN: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-indigo-950 via-slate-950 to-purple-950 p-12 flex-col justify-between overflow-hidden border-r border-border/40">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Logo size="lg" linkTo="" />
        </div>

        <div className="relative z-10 max-w-lg space-y-8 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Your Career Transformation Today</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Create Your Free Account & <br />
              <span className="bg-linear-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Unlock AI Learning.
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Join thousands of students and engineering graduates mastering skills through structured roadmaps, smart notes, and real-time AI mock interviews.
            </p>
          </motion.div>

          <div className="space-y-3.5 pt-2">
            {[
              "Personalized curriculum adapted to your dream job role",
              "Interactive quizzes with instant AI explanations",
              "Verifiable certificate of completion on your public profile",
              "Unlimited access to mock interviews & voice practice",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-medium text-slate-200">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10">
          <p className="text-xs font-serif italic text-slate-400 tracking-wide">
            "Learn, Practice, Get Certified, Get Hired."
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-6 py-6"
        >
          <div className="lg:hidden flex justify-center mb-2">
            <Logo size="md" />
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start your AI learning journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <input
                type="text"
                placeholder="Enter a name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-foreground placeholder:text-muted-foreground/60 transition-all shadow-xs"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password (min. 8 characters)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs text-foreground placeholder:text-muted-foreground/60 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-border text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none">
                I agree to the <span className="text-indigo-500 hover:underline">Terms & Conditions</span>
              </label>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-2.5 text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-indigo-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

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
