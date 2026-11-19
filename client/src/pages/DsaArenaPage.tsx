import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Code2,
  Play,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Cpu,
  Trophy,
  ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { dsaService, DsaProblem, CodeEvaluationResult, FALLBACK_DSA_PROBLEMS } from "../services/dsaService"

export const DsaArenaPage: React.FC = () => {
  const { problemId } = useParams<{ problemId?: string }>()
  const navigate = useNavigate()

  const [problems, setProblems] = useState<DsaProblem[]>(FALLBACK_DSA_PROBLEMS)
  const [currentProblem, setCurrentProblem] = useState<DsaProblem>(FALLBACK_DSA_PROBLEMS[0])
  const [language, setLanguage] = useState<"python" | "javascript" | "typescript" | "java" | "cpp">("python")
  const [code, setCode] = useState<string>(FALLBACK_DSA_PROBLEMS[0].starterCode.python)
  const [running, setRunning] = useState(false)
  const [evalResult, setEvalResult] = useState<CodeEvaluationResult | null>(null)
  const [activeTab, setActiveTab] = useState<"description" | "hints">("description")
  const [activeTestTab, setActiveTestTab] = useState<number>(0)
  const [solvedProblems, setSolvedProblems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pathlearn_dsa_solved")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [searchFilter, setSearchFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL")

  // Load all problems
  useEffect(() => {
    async function load() {
      try {
        const list = await dsaService.getProblems()
        if (list && list.length > 0) {
          setProblems(list)

          const selected = problemId
            ? list.find((p) => p.id === problemId || p.slug === problemId) || list[0]
            : list[0]

          if (selected) {
            setCurrentProblem(selected)
            setCode(selected.starterCode?.[language] || selected.starterCode?.python || "")
          }
        }
      } catch (err) {
        console.error("Failed to load problems", err)
      }
    }
    load()
  }, [problemId])

  // Update starter code when language or current problem changes
  useEffect(() => {
    if (currentProblem && currentProblem.starterCode) {
      setCode(currentProblem.starterCode[language] || currentProblem.starterCode.python || "")
      setEvalResult(null)
      setActiveTestTab(0)
    }
  }, [language, currentProblem?.id])

  const handleSelectProblem = (prob: DsaProblem) => {
    setCurrentProblem(prob)
    navigate(`/dsa/${prob.slug}`)
    setEvalResult(null)
  }

  const handleRunCode = async () => {
    if (!currentProblem || running) return
    setRunning(true)
    try {
      const res = await dsaService.runCode(currentProblem.id, code, language)
      setEvalResult(res)
    } catch (err) {
      console.error("Run error", err)
    } finally {
      setRunning(false)
    }
  }

  const handleSubmitCode = async () => {
    if (!currentProblem || running) return
    setRunning(true)
    try {
      const res = await dsaService.submitCode(currentProblem.id, code, language)
      setEvalResult(res)

      if (res.passed) {
        if (!solvedProblems.includes(currentProblem.id)) {
          const updated = [...solvedProblems, currentProblem.id]
          setSolvedProblems(updated)
          try {
            localStorage.setItem("pathlearn_dsa_solved", JSON.stringify(updated))
          } catch {}
        }
      }
    } catch (err) {
      console.error("Submit error", err)
    } finally {
      setRunning(false)
    }
  }

  const handleNextProblem = () => {
    if (evalResult?.nextProblem) {
      navigate(`/dsa/${evalResult.nextProblem.slug}`)
      const nextP = problems.find((p) => p.id === evalResult.nextProblem?.id || p.slug === evalResult.nextProblem?.slug)
      if (nextP) {
        setCurrentProblem(nextP)
      }
    }
  }

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchFilter.toLowerCase())
    const matchesCat = categoryFilter === "ALL" || p.category === categoryFilter
    const matchesDiff = difficultyFilter === "ALL" || p.difficulty === difficultyFilter
    return matchesSearch && matchesCat && matchesDiff
  })

  const isCurrentSolved = solvedProblems.includes(currentProblem.id)
  const examplesList = currentProblem.examples || []
  const hintsList = currentProblem.hints || []
  const constraintsList = currentProblem.constraints || []
  const testCasesList = currentProblem.testCases || []
  const companiesList = currentProblem.companies || ["Google", "Amazon", "Meta"]

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Track Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                DSA Coding Arena
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                LeetCode AI Judge
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time AI code execution, test-case verification, error diagnosis, and sequential progression
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Solved: {solvedProblems.length} / {problems.length}</span>
          </div>
        </div>
      </div>

      {/* Problem Quick Selector Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-muted/30 border border-border/70">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder="Search problems (e.g. Two Sum, Palindrome)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {problems.slice(0, 6).map((prob) => {
            const isSelected = prob.id === currentProblem.id
            const isSolved = solvedProblems.includes(prob.id)
            return (
              <button
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-card hover:bg-muted text-foreground border border-border/80"
                }`}
              >
                {isSolved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                <span>{prob.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main LeetCode Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT PANE (5 Cols): Problem Description, Examples, Constraints, Hints */}
        <div className="lg:col-span-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="p-3 px-5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("description")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "description"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("hints")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === "hints"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Hints ({hintsList.length})</span>
              </button>
            </div>

            {isCurrentSolved && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Solved
              </span>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
            {activeTab === "description" ? (
              <>
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      #{currentProblem.leetcodeNumber || 1}
                    </span>
                    <h2 className="text-lg font-black text-foreground">
                      {currentProblem.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        currentProblem.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : currentProblem.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                    >
                      {currentProblem.difficulty}
                    </span>

                    <span className="text-[10px] font-medium bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground border border-border">
                      {currentProblem.category}
                    </span>

                    <span className="text-[10px] text-muted-foreground font-mono">
                      Acceptance: {currentProblem.acceptanceRate}
                    </span>
                  </div>

                  {/* Company Badges */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">Asked at:</span>
                    <div className="flex flex-wrap gap-1">
                      {companiesList.map((c) => (
                        <span
                          key={c}
                          className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Markdown Description */}
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-sans pt-2 border-t border-border/60">
                  {currentProblem.description}
                </div>

                {/* Examples */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Examples
                  </h3>
                  {examplesList.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5 font-mono text-[11px]"
                    >
                      <div className="text-muted-foreground">
                        <strong className="text-foreground">Input:</strong> {ex.input}
                      </div>
                      <div className="text-muted-foreground">
                        <strong className="text-foreground">Output:</strong> {ex.output}
                      </div>
                      {ex.explanation && (
                        <div className="text-muted-foreground font-sans text-[11px] pt-1 text-muted-foreground/90">
                          <strong>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs font-mono">
                    {constraintsList.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              /* Hints Tab */
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Guided Problem Solving Approach</span>
                </div>
                <div className="space-y-3">
                  {hintsList.map((hint, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground space-y-1"
                    >
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                        Hint {hIdx + 1}
                      </span>
                      <p className="leading-relaxed text-muted-foreground">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE (7 Cols): Code Editor, Test Cases, Run/Submit & Error Feedback */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden">
          {/* Top Code Bar */}
          <div className="p-3 px-5 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-xs font-semibold rounded-xl bg-card border border-border px-3 py-1.5 text-foreground outline-none cursor-pointer"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ (g++ 20)</option>
              </select>
            </div>

            <button
              onClick={() => setCode(currentProblem.starterCode?.[language] || "")}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="Reset code to starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Code Textarea Editor */}
          <div className="relative flex-1 bg-zinc-950 dark:bg-black font-mono text-xs sm:text-sm p-4 min-h-[280px]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[260px] bg-transparent text-emerald-400 placeholder:text-zinc-600 outline-none resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Run / Submit Action Bar */}
          <div className="p-3.5 px-5 border-t border-b border-border/80 bg-muted/20 flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab("hints")}
              className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Need Approach Hint?</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRunCode}
                disabled={running}
                variant="outline"
                className="rounded-xl text-xs font-semibold gap-1.5 border-border hover:bg-muted cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-foreground" />
                <span>Run Code</span>
              </Button>

              <Button
                onClick={handleSubmitCode}
                disabled={running}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Submit Solution</span>
              </Button>
            </div>
          </div>

          {/* Output & Test Results Console */}
          <div className="p-5 bg-card min-h-[190px] space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Execution Results & Test Cases
              </span>
              {running && (
                <span className="text-xs text-indigo-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Judge evaluating code...</span>
                </span>
              )}
            </div>

            {/* Test Case Result Tabs */}
            {evalResult ? (
              <div className="space-y-4">
                {/* Result Status Banner */}
                {evalResult.passed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-base font-black text-emerald-500">
                          Accepted! All Test Cases Passed
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Runtime: {evalResult.runtimeMs}ms (Beats {evalResult.beatsPercent || 95}%) • Memory: {evalResult.memoryMb}MB • +{evalResult.xpEarned || 50} XP
                      </p>
                    </div>

                    {evalResult.nextProblem && (
                      <Button
                        onClick={handleNextProblem}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 py-2 gap-1.5 shrink-0 shadow-xs cursor-pointer"
                      >
                        <span>Next: {evalResult.nextProblem.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-foreground space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <span className="text-sm font-black text-rose-500">
                        {evalResult.status}
                      </span>
                    </div>

                    {evalResult.aiErrorAnalysis && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Diagnosis:</strong> {evalResult.aiErrorAnalysis}
                      </p>
                    )}

                    {evalResult.hint && (
                      <div className="text-[11px] text-amber-500 flex items-start gap-1.5 pt-1 border-t border-rose-500/20 font-medium">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                        <span><strong>Fix Hint:</strong> {evalResult.hint}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Individual Test Cases Selector */}
                {evalResult.testResults && evalResult.testResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {evalResult.testResults.map((tc, tcIdx) => (
                        <button
                          key={tcIdx}
                          onClick={() => setActiveTestTab(tcIdx)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTestTab === tcIdx
                              ? "bg-card text-foreground shadow-xs border border-border"
                              : "text-muted-foreground hover:text-foreground bg-muted/40"
                          }`}
                        >
                          {tc.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-500" />
                          )}
                          <span>Case {tcIdx + 1}</span>
                        </button>
                      ))}
                    </div>

                    {/* Active Test Case Detail */}
                    {evalResult.testResults[activeTestTab] && (
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 font-mono text-xs space-y-2">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Input:
                          </span>
                          <span className="text-foreground">{evalResult.testResults[activeTestTab].input}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Expected Output:
                          </span>
                          <span className="text-emerald-500 font-bold">{evalResult.testResults[activeTestTab].expected}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Your Output:
                          </span>
                          <span
                            className={
                              evalResult.testResults[activeTestTab].passed
                                ? "text-emerald-500 font-bold"
                                : "text-rose-500 font-bold"
                            }
                          >
                            {evalResult.testResults[activeTestTab].actual}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Default testcase preview before running */
              <div className="space-y-3 font-mono text-xs text-muted-foreground">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
                  <div>
                    <strong className="text-foreground">Sample Test Case:</strong> {testCasesList[0]?.input || "nums = [2,7,11,15], target = 9"}
                  </div>
                  <div>
                    <strong className="text-foreground">Expected:</strong> {testCasesList[0]?.expectedOutput || "[0,1]"}
                  </div>
                </div>
                <p className="text-[11px] font-sans text-muted-foreground">
                  Click <strong>Run Code</strong> to test your solution or <strong>Submit Solution</strong> to run full automated AI verification.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DsaArenaPage
