import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Award
} from "lucide-react"
import { ThemeToggle } from "../common/ThemeToggle"
import { UserAvatar } from "../common/UserAvatar"
import { CommandPalette } from "../common/CommandPalette"
import { useAuth } from "../../context/AuthContext"
import { formatFullName } from "../../lib/greeting"

interface TopbarProps {
  onOpenMobileMenu?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/domains?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      setIsCommandOpen(true)
    }
  }

  const notifications = [
    {
      id: "n-1",
      title: "New AI Mock Interview ready",
      desc: "Practice Machine Learning interview questions now.",
      time: "10m ago",
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-500/10"
    },
    {
      id: "n-2",
      title: "Quiz Result: 90% passed",
      desc: "You scored 90% in NumPy Basics quiz.",
      time: "5h ago",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      id: "n-3",
      title: "Certificate Issued",
      desc: "Your Python Development certificate is available.",
      time: "2d ago",
      icon: Award,
      color: "text-amber-500 bg-amber-500/10"
    }
  ]

  const displayName = formatFullName(user?.name) || "Learner"

  return (
    <>
      <header className="sticky top-0 z-20 h-16 border-b border-border/70 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Global Search Bar (opens Command Palette) */}
          <div
            onClick={() => setIsCommandOpen(true)}
            className="relative w-full max-w-md hidden sm:flex items-center cursor-pointer group"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="w-full pl-10 pr-12 py-2 text-xs rounded-xl bg-card border border-border/80 group-hover:border-indigo-500/50 group-hover:bg-muted/40 text-muted-foreground transition-all shadow-xs flex items-center">
              Search roadmaps, mock interviews, skills...
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border/60 select-none group-hover:border-indigo-500/30">
              ⌘K
            </div>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-transparent hover:border-border/60 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-background animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Notifications
                  </span>
                  <span className="text-[11px] text-indigo-500 hover:underline cursor-pointer">
                    Mark all as read
                  </span>
                </div>
                <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon
                    return (
                      <div
                        key={n.id}
                        className="p-3.5 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{n.desc}</p>
                          <span className="text-[10px] text-muted-foreground/70 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative pl-1">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border/60 cursor-pointer"
            >
              <UserAvatar
                name={displayName}
                avatarUrl={user?.avatarUrl}
                size="sm"
                showOnlineStatus
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground tracking-tight leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {user?.targetRole || "AI / ML Engineer"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden lg:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-border/60">
                  <p className="text-xs font-bold text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email || "punithkr@gmail.com"}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/profile")
                      setShowUserDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings")
                      setShowUserDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate("/certificates")
                      setShowUserDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted/60 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Certificates</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                <div className="pt-1 border-t border-border/60">
                  <button
                    onClick={async () => {
                      setShowUserDropdown(false)
                      await logout()
                      navigate("/login")
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global ⌘K Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  )
}

export default Topbar
