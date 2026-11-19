import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Compass,
  Mic,
  Award,
  Briefcase,
  User,
  Settings,
  Sparkles,
  BookOpen,
  ArrowRight,
  Sun,
  Moon,
  X,
  Code2,
  FileText,
} from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandItem {
  id: string
  title: string
  subtitle: string
  category: "Roadmaps" | "AI Features" | "Account" | "Tools"
  icon: any
  action: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: CommandItem[] = [
    // Roadmaps
    {
      id: "ai-engineer",
      title: "AI Engineer Roadmap",
      subtitle: "Machine Learning, LLMs, Vector DBs, PyTorch",
      category: "Roadmaps",
      icon: Sparkles,
      action: () => navigate("/domains/ai-engineer"),
    },
    {
      id: "fullstack-dev",
      title: "Full-Stack Web Development",
      subtitle: "React, Node.js, Next.js, PostgreSQL",
      category: "Roadmaps",
      icon: Compass,
      action: () => navigate("/domains/fullstack-development"),
    },
    {
      id: "data-science",
      title: "Data Science & Analytics",
      subtitle: "Pandas, NumPy, Scikit-Learn, Visualization",
      category: "Roadmaps",
      icon: BookOpen,
      action: () => navigate("/domains/data-science"),
    },
    // AI Features
    {
      id: "ai-chat",
      title: "AI Chatbot & Resume Copilot",
      subtitle: "Ask ChatGPT/Claude style questions with resume context",
      category: "AI Features",
      icon: Sparkles,
      action: () => navigate("/ai-chat"),
    },
    {
      id: "dsa-arena",
      title: "DSA Coding Arena (LeetCode Judge)",
      subtitle: "Solve algorithm problems with live AI code execution",
      category: "Tools",
      icon: Code2,
      action: () => navigate("/dsa"),
    },
    {
      id: "resume-builder",
      title: "ATS Resume Builder Studio",
      subtitle: "Build & optimize A4 resumes with AI bullet improver & JD match",
      category: "Tools",
      icon: FileText,
      action: () => navigate("/resume-builder"),
    },
    {
      id: "research-paper",
      title: "AI Research Paper Studio",
      subtitle: "Generate IEEE/APA research papers with plagiarism & citation safeguards",
      category: "AI Features",
      icon: BookOpen,
      action: () => navigate("/research-paper"),
    },
    {
      id: "mock-interview",
      title: "Start AI Mock Interview",
      subtitle: "Practice with speech, visual avatar, and AI feedback",
      category: "AI Features",
      icon: Mic,
      action: () => navigate("/interview-setup/ai-engineer"),
    },
    {
      id: "jobs",
      title: "Tech Jobs & Internships (India & Bangalore)",
      subtitle: "Verified openings at Google, Microsoft, Flipkart, Razorpay & apply directly",
      category: "Tools",
      icon: Briefcase,
      action: () => navigate("/jobs"),
    },
    {
      id: "career-profile",
      title: "AI Career Profile & Resume Optimizer",
      subtitle: "ATS keyword analysis & job readiness score",
      category: "AI Features",
      icon: Briefcase,
      action: () => navigate("/career-profile"),
    },
    {
      id: "skill-gaps",
      title: "Skill Gap Benchmark",
      subtitle: "Identify missing skills for target roles",
      category: "AI Features",
      icon: Sparkles,
      action: () => navigate("/career-profile/skill-gap"),
    },
    // Tools
    {
      id: "certificates",
      title: "Verifiable Certificates",
      subtitle: "View earned certificates and shareable credentials",
      category: "Tools",
      icon: Award,
      action: () => navigate("/certificates"),
    },
    {
      id: "toggle-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      subtitle: "Toggle visual theme preference",
      category: "Tools",
      icon: theme === "dark" ? Sun : Moon,
      action: () => toggleTheme(),
    },
    // Account
    {
      id: "my-profile",
      title: "User Profile & Progress",
      subtitle: "View learning statistics and account details",
      category: "Account",
      icon: User,
      action: () => navigate("/profile"),
    },
    {
      id: "settings",
      title: "Account Settings",
      subtitle: "Manage preferences and notification options",
      category: "Account",
      icon: Settings,
      action: () => navigate("/settings"),
    },
  ]

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1))
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault()
        const selected = filtered[selectedIndex]
        if (selected) {
          selected.action()
          onClose()
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, filtered, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-28 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-border/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search roadmaps, interviews, tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No results matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              const isSelected = selectedIndex === idx

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-600 text-white" : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.title}</p>
                      <p
                        className={`text-[11px] truncate ${
                          isSelected ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="p-2.5 px-4 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>PathLearn Command Hub</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
