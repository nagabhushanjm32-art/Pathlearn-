import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Filter, Compass, Sparkles } from "lucide-react"
import { DomainCard } from "../components/domains/DomainCard"
import { EmptyState } from "../components/common/EmptyState"
import { domainService } from "../services/domainService"
import { Domain } from "../types"

export default function DomainExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  const initialSearch = searchParams.get("search") || ""
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState<string>("ALL")

  useEffect(() => {
    async function fetchDomains() {
      try {
        const data = await domainService.getDomains()
        setDomains(data)
      } catch (err) {
        console.error("Failed to load domains", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDomains()
  }, [])

  useEffect(() => {
    const s = searchParams.get("search")
    if (s !== null) {
      setSearchQuery(s)
    }
  }, [searchParams])

  const filteredDomains = domains.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.skillTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDifficulty =
      selectedDifficulty === "ALL" || d.difficulty === selectedDifficulty

    const matchesCategory = () => {
      const slug = d.slug || d.id
      if (activeTab === "ALL") return true
      if (activeTab === "AI_DATA")
        return [
          "ai-engineer",
          "machine-learning-engineer",
          "data-scientist",
          "generative-ai-engineer",
        ].includes(slug)
      if (activeTab === "DEV") return ["python-developer", "web-developer"].includes(slug)
      if (activeTab === "DATA") return ["data-analyst", "data-scientist"].includes(slug)
      return true
    }

    return matchesSearch && matchesDifficulty && matchesCategory()
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-indigo-900/30 via-card to-purple-900/20 border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Curriculum Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Explore Learning Domains
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Select a specialized technical path curated by industry engineers. Complete structured roadmap steps, pass interactive quizzes, and unlock your AI mock interview.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border overflow-x-auto">
          {[
            { id: "ALL", label: "All 7 Tracks" },
            { id: "AI_DATA", label: "AI & Machine Learning" },
            { id: "DEV", label: "Software & Web Development" },
            { id: "DATA", label: "Data Analytics & Science" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Select */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by skill, name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchParams({ search: e.target.value })
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-foreground placeholder:text-muted-foreground/60 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Domains Grid */}
      {filteredDomains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No domains match your search"
          description="Try clearing your filters or search query to explore all available engineering tracks."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("")
            setSelectedDifficulty("ALL")
            setActiveTab("ALL")
            setSearchParams({})
          }}
        />
      )}
    </div>
  )
}
