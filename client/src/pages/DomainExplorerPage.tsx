import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchDomains, type Domain } from "../services/domains"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Code2,
  GitBranch,
  Brain,
  BarChart3,
  Globe,
  ShieldCheck,
  Cloud,
  Database,
  Search,
  Clock,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  GitBranch,
  Brain,
  BarChart3,
  Globe,
  ShieldCheck,
  Cloud,
  Database,
}

const DIFFICULTY_STYLES: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-400 border-green-500/30",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ADVANCED: "bg-red-500/10 text-red-400 border-red-500/30",
}

export default function DomainExplorerPage() {
  const navigate = useNavigate()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL")

  useEffect(() => {
    fetchDomains()
      .then(setDomains)
      .catch(() => setError("Could not load domains"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = domains.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.skillTags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesDifficulty = difficultyFilter === "ALL" || d.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Explore Domains</h1>
          <p className="text-neutral-400 mt-1">Choose a path to start your AI-curated learning journey</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search domains or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-white bg-neutral-900 border-gray-600 placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  difficultyFilter === level
                    ? "bg-white text-black border-white"
                    : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500"
                }`}
              >
                {level === "ALL" ? "All" : level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-neutral-500">Loading domains...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-neutral-500">No domains match your search.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((domain) => {
            const Icon = (domain.icon && ICON_MAP[domain.icon]) || Code2
            return (
              <div
                key={domain.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${DIFFICULTY_STYLES[domain.difficulty]}`}
                  >
                    {domain.difficulty.charAt(0) + domain.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-1.5">{domain.name}</h3>
                <p className="text-sm text-neutral-400 mb-4 flex-1">{domain.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {domain.skillTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    ~{domain.estimatedDays} days
                  </span>
                  <Button size="sm" onClick={() => navigate(`/domains/${domain.id}`)}>
                    Start Learning
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
