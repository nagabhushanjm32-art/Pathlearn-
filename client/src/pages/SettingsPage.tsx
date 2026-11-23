import React, { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { Bell, Moon, Sun, Shield, User, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState(user?.name || "Punith K R")
  const [targetRole, setTargetRole] = useState(user?.targetRole || "AI / ML Engineer")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [interviewAudio, setInterviewAudio] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  // Keep fields synced if user profile refreshes
  useEffect(() => {
    if (user?.name) setName(user.name)
    if (user?.targetRole) setTargetRole(user.targetRole)
  }, [user?.name, user?.targetRole])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProfile({ name: name.trim(), targetRole: targetRole.trim() })
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your personal profile, appearance theme, and mock interview preferences.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}

      {/* Profile Info Section */}
      <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <User className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Profile Information</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-card border border-border text-foreground outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Target Job Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-card border border-border text-foreground outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user?.email || "punithkr@gmail.com"}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/60 border border-border text-muted-foreground cursor-not-allowed"
            />
          </div>

          <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSaving ? "Saving..." : "Save Profile"}</span>
          </Button>
        </form>
      </div>

      {/* Appearance Theme */}
      <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sun className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Appearance Theme</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === "dark"
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold ring-1 ring-indigo-500/30"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark Mode (Default)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === "light"
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 font-bold ring-1 ring-indigo-500/30"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs">Light Mode</span>
          </button>
        </div>
      </div>

      {/* Notifications & Preferences */}
      <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Bell className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Preferences</h2>
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Email Notifications</p>
              <p className="text-[11px] text-muted-foreground">Receive weekly learning summaries and certificate alerts</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded border-border text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">AI Mock Interview Voice Synthesis</p>
              <p className="text-[11px] text-muted-foreground">Read questions aloud using text-to-speech audio</p>
            </div>
            <input
              type="checkbox"
              checked={interviewAudio}
              onChange={(e) => setInterviewAudio(e.target.checked)}
              className="rounded border-border text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Security & Authentication */}
      <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Shield className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Security & Tokens</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Your account is secured with JWT tokens. Password encryption is configured with bcrypt in the backend architecture.
        </p>
      </div>
    </div>
  )
}
