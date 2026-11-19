import React from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Mic,
  Award,
  TrendingUp,
  Briefcase,
  User,
  Settings,
  LogOut,
  X,
  MessageSquare,
  Code2,
  Sparkles,
  FileText,
  GraduationCap,
} from "lucide-react"
import { Logo } from "../common/Logo"
import { useAuth } from "../../context/AuthContext"

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    if (onCloseMobile) {
      onCloseMobile()
    }
    await logout()
    navigate("/login")
  }

  const primaryNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Learning", href: "/domains/ai-engineer", icon: BookOpen },
    { label: "Domains", href: "/domains", icon: Compass },
    { label: "AI Chatbot", href: "/ai-chat", icon: MessageSquare, badge: "AI Copilot" },
    { label: "DSA Arena", href: "/dsa", icon: Code2, badge: "LeetCode" },
    { label: "Jobs & Internships", href: "/jobs", icon: Briefcase, badge: "India/BLR" },
    { label: "Resume Builder", href: "/resume-builder", icon: FileText, badge: "ATS 100%" },
    { label: "Research Papers", href: "/research-paper", icon: BookOpen, badge: "IEEE/APA" },
    { label: "AI Career Profile", href: "/career-profile", icon: Briefcase },
    { label: "Mock Interviews", href: "/mock-interview/ai-engineer", icon: Mic },
    { label: "Certificates", href: "/certificates", icon: Award },
    { label: "Progress", href: "/profile", icon: TrendingUp },
  ]

  const bottomNavItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ]

  const navContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between">
        <Logo size="md" />
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3 py-2">
          Navigation
        </div>
        {primaryNavItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href))
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                isActive
                  ? "bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="w-1.5 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Bottom User / Settings Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3 py-1">
          Account
        </div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                }`}
              />
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-500/90 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors mt-2 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 shadow-sm">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
