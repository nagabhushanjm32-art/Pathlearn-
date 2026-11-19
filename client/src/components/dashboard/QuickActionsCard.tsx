import React from "react"
import { useNavigate } from "react-router-dom"
import { MessageSquare, Code2, Mic, FileText, Target, Award, ArrowUpRight, Sparkles, BookOpen, Briefcase } from "lucide-react"

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate()

  const actions = [
    {
      title: "Tech Jobs & Internships",
      desc: "Verified roles & internships in Bangalore, Karnataka & India",
      icon: Briefcase,
      route: "/jobs",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      badge: "India / BLR",
    },
    {
      title: "AI Chat & Resume Copilot",
      desc: "Ask ChatGPT/Claude style questions with resume context",
      icon: MessageSquare,
      route: "/ai-chat",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      badge: "Gemini Copilot",
    },
    {
      title: "DSA Coding Arena",
      desc: "LeetCode problem solver with live AI code execution judge",
      icon: Code2,
      route: "/dsa",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badge: "AI Judge",
    },
    {
      title: "AI Mock Interview",
      desc: "Simulate real engineering interview with voice/avatar",
      icon: Mic,
      route: "/interview-setup/ai-engineer",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      badge: "Live Audio/Avatar",
    },
    {
      title: "ATS Resume Builder",
      desc: "Build A4 ATS-friendly resumes with AI bullet improver & JD matcher",
      icon: FileText,
      route: "/resume-builder",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badge: "ATS 100%",
    },
    {
      title: "AI Research Paper Studio",
      desc: "Generate IEEE/APA academic papers with plagiarism & authenticity guards",
      icon: BookOpen,
      route: "/research-paper",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      badge: "IEEE / APA",
    },
    {
      title: "Resume & ATS Benchmark",
      desc: "Upload resume to extract skills & target role gaps",
      icon: Target,
      route: "/career-profile",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badge: "ATS Analyzer",
    },
  ]

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Accelerate Your Prep</h3>
            <p className="text-[10px] text-muted-foreground">High-impact actions to boost engineering hireability</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <div
              key={act.title}
              onClick={() => navigate(act.route)}
              className="p-3.5 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/70 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`p-2 rounded-xl border ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-background px-1.5 py-0.5 rounded-md border border-border/50">
                    {act.badge}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <div className="mt-3 space-y-0.5">
                <h4 className="text-xs font-bold text-foreground group-hover:text-indigo-500 transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                  {act.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActionsCard
