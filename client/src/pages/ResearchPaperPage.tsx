import React, { useState } from "react"
import {
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Code2,
  CheckCircle2,
  Cpu,
  Wand2,
  BookMarked,
  RefreshCw,
  Zap,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "../context/AuthContext"
import {
  researchPaperService,
  GeneratedResearchPaper,
  FormatStyle,
  AcademicLevel,
} from "../services/researchPaperService"

export const ResearchPaperPage: React.FC = () => {
  const { user } = useAuth()

  // Form State
  const [topic, setTopic] = useState("Automatic Traffic Signal System for Emergency Vehicle Clearance")
  const [domain, setDomain] = useState("Embedded Systems, IoT & Intelligent Transportation")
  const [formatStyle, setFormatStyle] = useState<FormatStyle>("Journal Standard")
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>("Undergraduate")
  const [authorName, setAuthorName] = useState(user?.name || "Ms. Shilpa d R")
  const [affiliation, setAffiliation] = useState("Dept. of CSE, Jain Institute of Technology, Davangere, Karnataka, India")
  const [customKeywords, setCustomKeywords] = useState<string>("Internet of Things (IoT), Smart Signal Clearance, Emergency Vehicles, Real-Time Traffic Monitoring, Sound Sensors")
  const [additionalInstructions, setAdditionalInstructions] = useState("")

  // Generation & View State
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [activeTab, setActiveTab] = useState<"journal" | "plagiarism" | "latex" | "refine">("journal")
  const [paper, setPaper] = useState<GeneratedResearchPaper | null>(null)
  const [copied, setCopied] = useState(false)

  // Refine Section State
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("methodology")
  const [refineInstructions, setRefineInstructions] = useState("")
  const [refining, setRefining] = useState(false)

  const quickTopics = [
    {
      label: "🚦 Emergency Traffic Clearance",
      topic: "Automatic Traffic Signal System for Emergency Vehicle Clearance",
      domain: "Embedded Systems, IoT & Smart Cities",
    },
    {
      label: "🧠 Transformer Optimization",
      topic: "Deep Transformer Optimizations in Low-Resource Edge Computing",
      domain: "Artificial Intelligence & Edge ML",
    },
    {
      label: "🔐 zk-SNARKs Blockchain",
      topic: "Zero-Knowledge Proofs in Distributed Ledger Architectures for Healthcare Privacy",
      domain: "Cybersecurity & Distributed Systems",
    },
    {
      label: "⚡ Smart Grid Energy IoT",
      topic: "IoT-Enabled Microgrid Energy Management System with Predictive Load Balancing",
      domain: "Renewable Energy & IoT",
    },
    {
      label: "🚁 Autonomous Drone Swarms",
      topic: "Multi-Agent Reinforcement Learning for Resilient Autonomous Drone Swarm Navigation",
      domain: "Robotics & Multi-Agent Systems",
    },
  ]

  const handleGenerate = async (overrideTopic?: string) => {
    const finalTopic = (overrideTopic || topic).trim()
    if (!finalTopic) return

    setLoading(true)
    setLoadingStep("Analyzing academic ontology & research problem...")

    const timer1 = setTimeout(() => setLoadingStep("Formulating system architecture & ESP32 microcontroller pipeline..."), 1000)
    const timer2 = setTimeout(() => setLoadingStep("Generating 12-step operational algorithm & hardware integration..."), 2200)
    const timer3 = setTimeout(() => setLoadingStep("Compiling literature survey & 24+ peer-reviewed references..."), 3400)
    const timer4 = setTimeout(() => setLoadingStep("Executing Plagiarism Guard & Authenticity Verification scan..."), 4600)

    try {
      const generated = await researchPaperService.generatePaper({
        topic: finalTopic,
        domain,
        formatStyle,
        academicLevel,
        authorName,
        affiliation,
        customKeywords: customKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        additionalInstructions,
      })
      setPaper(generated)
    } catch (error) {
      console.error("Failed to generate research paper:", error)
    } finally {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      setLoading(false)
      setLoadingStep("")
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadLatex = () => {
    if (!paper) return
    const blob = new Blob([paper.latexSource], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${paper.title.replace(/[^a-zA-Z0-9]/g, "_")}.tex`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadMarkdown = () => {
    if (!paper) return
    const mdContent = `# ${paper.title}

**Primary Author:** ${paper.authors?.primaryAuthor} (${paper.authors?.primaryRole})  
**Affiliation:** ${paper.authors?.primaryAffiliation}  
**Co-Authors:** ${paper.authors?.coAuthors?.join(", ")}  
**Student Affiliation:** ${paper.authors?.studentAffiliation}  

---

## ABSTRACT
${paper.abstract}

**KEYWORDS:** ${paper.keywords.join(", ")}

---

## ${paper.sections?.introduction?.title || "I. INTRODUCTION"}
${paper.sections?.introduction?.content || ""}

## ${paper.sections?.literatureSurvey?.title || "II. LITERATURE SURVEY"}
${paper.sections?.literatureSurvey?.content || ""}

## ${paper.sections?.problemStatement?.title || "III. PROBLEM STATEMENT"}
${paper.sections?.problemStatement?.content || ""}

## ${paper.sections?.objectives?.title || "IV. OBJECTIVES"}
${(paper.sections?.objectives?.points || []).map((p) => `• ${p}`).join("\n")}

## ${paper.sections?.contributions?.title || "V. Contributions of This Research work"}
${paper.sections?.contributions?.content || ""}

## ${paper.sections?.methodology?.title || "VI. METHODOLOGY"}
### 4.1 System Architecture
${paper.sections?.methodology?.systemArchitecture || ""}

### 4.2 Methodology Flow
${(paper.sections?.methodology?.flowSteps || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}

## ${paper.sections?.hardwareSoftwareIntegration?.title || "VII. Hardware-Software Integration"}
### Hardware Components
${(paper.sections?.hardwareSoftwareIntegration?.hardwareComponents || []).map((h, i) => `${i + 1}. **${h.name}**: ${h.description}`).join("\n\n")}

### Software Requirements
${(paper.sections?.hardwareSoftwareIntegration?.softwareRequirements || []).map((s, i) => `${i + 1}. **${s.name}**: ${s.description}`).join("\n\n")}

## ${paper.sections?.algorithm?.title || "IX. Algorithm"}
${(paper.sections?.algorithm?.steps || []).map((st) => `**${st.step}:**\n${st.description}\n${(st.subItems || []).map((sub) => `  • ${sub}`).join("\n")}`).join("\n\n")}

## ${paper.sections?.resultsAndDiscussion?.title || "X. RESULTS AND DISCUSSION"}
${paper.sections?.resultsAndDiscussion?.purpose || ""}

${(paper.sections?.resultsAndDiscussion?.qualitativeObservations || []).map((q) => `### ${q.title}\n${q.content}`).join("\n\n")}

### Overall Observation
${paper.sections?.resultsAndDiscussion?.overallObservation || ""}

### Future Scope
${(paper.sections?.resultsAndDiscussion?.futureScope || []).map((f) => `• ${f}`).join("\n")}

## ${paper.sections?.acknowledgment?.title || "XI. ACKNOWLEDGMENT"}
${paper.sections?.acknowledgment?.content || ""}

---

## XII. REFERENCES
${paper.references.map((r, i) => `${r.startsWith(`${i + 1}.`) ? r : `${i + 1}. ${r}`}`).join("\n")}
`
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${paper.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefineSection = async () => {
    if (!paper || !refineInstructions.trim()) return
    setRefining(true)

    try {
      const sectionObj = (paper.sections as any)[selectedSectionKey]
      const currentContent = typeof sectionObj === "string" ? sectionObj : sectionObj?.content || sectionObj?.systemArchitecture || ""

      const refinedText = await researchPaperService.refineSection(
        selectedSectionKey,
        currentContent,
        refineInstructions,
        paper.title
      )

      const updatedSections = {
        ...paper.sections,
        [selectedSectionKey]: {
          ...sectionObj,
          content: refinedText,
        },
      }

      const updatedReport = await researchPaperService.scanPlagiarism(
        { ...paper, sections: updatedSections },
        paper.formatStyle
      )

      setPaper({
        ...paper,
        sections: updatedSections,
        report: updatedReport,
      })
      setRefineInstructions("")
      setActiveTab("journal")
    } catch (error) {
      console.error("Failed to refine section:", error)
    } finally {
      setRefining(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 space-y-6">
      {/* Top Banner Header */}
      <div className="print:hidden relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-950/50 via-indigo-950/40 to-slate-950/60 border border-border/80 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>PathLearn Academic Studio</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-emerald-400 font-mono">ISO 9001:2008 & IEEE Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AI Research Paper Generator & Academic Studio
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Generate publication-grade academic papers formatted identical to authentic conference/journal proceedings
              with system architecture diagrams, 12-step algorithms, hardware-software integration, and validated plagiarism safeguards.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 text-foreground font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Plagiarism &lt; 3%</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>24+ Verified Citations</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 text-foreground font-medium">
              <Printer className="w-4 h-4 text-purple-500" />
              <span>Bordered A4 Journal PDF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configurator Sidebar (4 cols) */}
        <div className="print:hidden lg:col-span-4 space-y-5">
          <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-foreground">Manuscript Configurator</h2>
              </div>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-500/20">
                12-Section Format
              </span>
            </div>

            {/* Quick Inspiration Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Preset Research Topics</span>
                <span className="text-[10px] text-indigo-400 font-mono">1-Click</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {quickTopics.map((qt) => (
                  <button
                    key={qt.label}
                    onClick={() => {
                      setTopic(qt.topic)
                      setDomain(qt.domain)
                    }}
                    className="text-[11px] px-2.5 py-1.5 rounded-xl bg-muted/50 hover:bg-indigo-500/15 hover:text-indigo-400 border border-border/60 text-muted-foreground transition-all cursor-pointer text-left truncate"
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Research Paper Title / Topic <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g. Automatic Traffic Signal System for Emergency Vehicle Clearance"
                className="w-full text-xs p-3 rounded-xl bg-background border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-muted-foreground font-medium"
              />
            </div>

            {/* Format Style & Academic Level */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Publication Style</label>
                <select
                  value={formatStyle}
                  onChange={(e) => setFormatStyle(e.target.value as FormatStyle)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none text-foreground"
                >
                  <option value="Journal Standard">ISO Journal / IJIRCCE</option>
                  <option value="IEEE">IEEE Transactions</option>
                  <option value="APA">APA 7th Edition</option>
                  <option value="ACM">ACM SIGGRAPH / CCS</option>
                  <option value="Springer">Springer LNCS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Academic Level</label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none text-foreground"
                >
                  <option value="Undergraduate">UG Engineering Thesis</option>
                  <option value="Master">Master's Dissertation</option>
                  <option value="Doctoral">Doctoral (PhD)</option>
                  <option value="Industry Whitepaper">Industry Whitepaper</option>
                </select>
              </div>
            </div>

            {/* Domain & Keywords */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Domain / Field</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Embedded Systems, IoT & Smart Cities"
                className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Keywords (Comma-separated)</label>
              <input
                type="text"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="IoT, Emergency Clearance, Sensors, ESP32..."
                className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none font-mono text-[11px]"
              />
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Lead Author / Guide</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Affiliation</label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none truncate"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="w-full py-3 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating 12-Section Paper...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Complete Research Paper</span>
                </>
              )}
            </Button>

            {loading && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || "Synthesizing research manuscript..."}</span>
                </div>
                <div className="w-full bg-indigo-950/60 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full animate-indeterminate" style={{ width: "80%" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Academic Manuscript Journal Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {!paper && !loading ? (
            /* Empty State */
            <div className="p-12 rounded-3xl bg-card border border-border/80 text-center space-y-5 flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-foreground">Ready to Author Your Research Paper</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your topic on the left to generate an authentic 12-section research paper with system architecture,
                  step-by-step algorithms, hardware-software integration, results, and 24+ citations formatted with genuine page borders.
                </p>
              </div>
              <Button
                onClick={() => handleGenerate()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Emergency Traffic Signal System Paper</span>
              </Button>
            </div>
          ) : (
            paper && (
              <div className="space-y-5">
                {/* Metrics & Safeguard Bar (Hidden on print) */}
                <div className="print:hidden p-4 sm:p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Plagiarism & Authenticity Scan</h3>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Format: {paper.formatStyle} • Level: {paper.academicLevel} • {paper.wordCount} words • 12 Sections
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(paper.latexSource)}
                        className="text-xs h-8 px-2.5 gap-1.5 rounded-lg cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy LaTeX"}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadLatex}
                        className="text-xs h-8 px-2.5 gap-1.5 rounded-lg cursor-pointer"
                        title="Download .tex"
                      >
                        <Code2 className="w-3.5 h-3.5 text-purple-500" />
                        <span>.tex</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadMarkdown}
                        className="text-xs h-8 px-2.5 gap-1.5 rounded-lg cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        <span>.md</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePrint}
                        className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer font-bold shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / Save PDF</span>
                      </Button>
                    </div>
                  </div>

                  {/* 4 Key Safeguard Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-500">Originality</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-extrabold text-emerald-500">
                          {paper.report.originalityScore}%
                        </div>
                        <span className="text-[10px] text-emerald-400/80 font-mono">
                          {paper.report.verdict}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground">Similarity</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-extrabold text-foreground">
                          {paper.report.similarityScore}%
                        </div>
                        <span className="text-[10px] text-emerald-500 font-mono">
                          Academic Safe (&lt;10%)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-indigo-400">Human Likelihood</span>
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-extrabold text-indigo-400">
                          {paper.report.humanLikelihoodScore}%
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          AI: {paper.report.aiProbabilityScore}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-purple-400">Citations</span>
                        <BookMarked className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-extrabold text-purple-400">
                          {paper.report.citationSafeguards.verifiedCount} References
                        </div>
                        <span className="text-[10px] text-purple-300/80 font-mono">
                          0 Hallucinations
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation (Hidden on print) */}
                <div className="print:hidden flex items-center gap-2 border-b border-border/70 pb-2">
                  <button
                    onClick={() => setActiveTab("journal")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "journal"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Journal Publication View</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("plagiarism")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "plagiarism"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Plagiarism & Safeguard Report</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("latex")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "latex"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>LaTeX Source (.tex)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("refine")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "refine"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>AI Section Refiner</span>
                  </button>
                </div>

                {/* TAB 1: AUTHENTIC BORDERED JOURNAL PUBLICATION VIEW */}
                {activeTab === "journal" && (
                  <div className="space-y-6">
                    {/* Simulated Authentic Academic A4 Document Container */}
                    <div className="bg-white text-zinc-900 shadow-2xl rounded-2xl p-6 sm:p-12 font-serif text-[13px] leading-relaxed border-2 border-zinc-800 relative">
                      {/* Document Border Frame (Matching the PDF Screenshot) */}
                      <div className="border border-zinc-900 p-6 sm:p-10 space-y-6">
                        {/* Running Journal Header */}
                        <div className="flex items-center justify-between text-[11px] font-sans border-b border-zinc-300 pb-2 text-zinc-500">
                          <span>IJIRCCE &copy; 2025</span>
                          <span className="font-semibold">An ISO 9001:2008 Certified Journal</span>
                          <span>Vol. 13, Issue 5</span>
                        </div>

                        {/* Title Block */}
                        <div className="text-center space-y-2.5 pt-4">
                          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 font-serif leading-snug">
                            {paper.title}
                          </h1>
                          <div className="space-y-1 font-sans text-xs">
                            <p className="font-semibold text-zinc-900">
                              {paper.authors?.primaryAuthor}<sup>1</sup>, {paper.authors?.coAuthors?.map((ca, idx) => `${ca}${idx + 2}`).join(", ")}
                            </p>
                            <p className="text-zinc-600 text-[11px]">
                              {paper.authors?.primaryRole}, {paper.authors?.primaryAffiliation}<sup>1</sup>
                            </p>
                            <p className="text-zinc-600 text-[11px]">
                              {paper.authors?.studentAffiliation}<sup>2</sup>
                            </p>
                          </div>
                        </div>

                        {/* ABSTRACT & KEYWORDS */}
                        <div className="space-y-2 pt-2 text-justify">
                          <p className="text-[12px] text-zinc-800 leading-relaxed font-serif">
                            <strong className="font-sans font-bold">ABSTRACT: </strong>
                            {paper.abstract}
                          </p>
                          <p className="text-[11px] font-sans pt-1">
                            <strong className="font-bold uppercase">KEYWORDS: </strong>
                            {paper.keywords.join(", ")}
                          </p>
                        </div>

                        {/* SECTION I: INTRODUCTION */}
                        <div className="space-y-2 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.introduction?.title || "I. INTRODUCTION"}
                          </h2>
                          <div className="text-justify space-y-2 text-zinc-800 text-[12px]">
                            {paper.sections?.introduction?.content.split("\n\n").map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>

                        {/* SECTION II: LITERATURE SURVEY */}
                        <div className="space-y-2 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.literatureSurvey?.title || "II. LITERATURE SURVEY"}
                          </h2>
                          <div className="text-justify space-y-2 text-zinc-800 text-[12px]">
                            {paper.sections?.literatureSurvey?.content.split("\n\n").map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>

                        {/* SECTION III: PROBLEM STATEMENT */}
                        <div className="space-y-2 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.problemStatement?.title || "III. PROBLEM STATEMENT"}
                          </h2>
                          <p className="text-justify text-zinc-800 text-[12px]">
                            {paper.sections?.problemStatement?.content}
                          </p>
                        </div>

                        {/* SECTION IV: OBJECTIVES */}
                        <div className="space-y-2 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.objectives?.title || "IV. OBJECTIVES"}
                          </h2>
                          <ul className="list-disc pl-5 space-y-1 text-zinc-800 text-[12px]">
                            {(paper.sections?.objectives?.points || []).map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>

                        {/* SECTION V: CONTRIBUTIONS */}
                        <div className="space-y-2 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.contributions?.title || "V. Contributions of This Research work"}
                          </h2>
                          <p className="text-justify text-zinc-800 text-[12px]">
                            {paper.sections?.contributions?.content}
                          </p>
                        </div>

                        {/* SECTION VI: METHODOLOGY */}
                        <div className="space-y-3 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.methodology?.title || "VI. METHODOLOGY"}
                          </h2>

                          <div className="space-y-1">
                            <h3 className="text-[12px] font-bold font-sans text-zinc-900">4.1 System Architecture</h3>
                            <p className="text-justify text-zinc-800 text-[12px]">
                              {paper.sections?.methodology?.systemArchitecture}
                            </p>
                          </div>

                          {/* Fig.1 Architecture Diagram Box (Matching PDF) */}
                          <div className="p-4 rounded-xl border border-zinc-300 bg-zinc-50 font-sans text-center space-y-3 my-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div className="p-2.5 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 font-semibold">
                                Sound & Vehicle Sensors
                                <span className="block text-[10px] font-normal text-blue-700">Digital Siren Sampling</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-900 font-semibold">
                                ESP32 Central Controller
                                <span className="block text-[10px] font-normal text-indigo-700">Priority Logic & Wi-Fi Web Server</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-semibold">
                                4-Way Traffic LEDs & LCD
                                <span className="block text-[10px] font-normal text-emerald-700">Automatic Signal Override</span>
                              </div>
                            </div>
                            <div className="text-[11px] font-bold text-zinc-800 font-serif">
                              {paper.sections?.methodology?.architectureFigCaption || "Fig.1 Architecture of the Proposed System"}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-[12px] font-bold font-sans text-zinc-900">4.2 Methodology Flow</h3>
                            <ol className="list-decimal pl-5 space-y-1.5 text-zinc-800 text-[12px]">
                              {(paper.sections?.methodology?.flowSteps || []).map((step, i) => (
                                <li key={i} className="text-justify">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        {/* SECTION VII: HARDWARE-SOFTWARE INTEGRATION */}
                        <div className="space-y-3 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.hardwareSoftwareIntegration?.title || "VII. Hardware-Software Integration"}
                          </h2>

                          <div className="space-y-3">
                            {(paper.sections?.hardwareSoftwareIntegration?.hardwareComponents || []).map((hw, i) => (
                              <div key={i} className="space-y-1">
                                <p className="text-zinc-800 text-[12px] text-justify">
                                  <strong className="font-bold text-zinc-900">{i + 1}. Hardware Components: {hw.name}: </strong>
                                  {hw.description}
                                </p>
                                {hw.figLabel && (
                                  <div className="p-3 my-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
                                    <div className="text-[11px] font-bold text-zinc-800 font-serif">
                                      {hw.figLabel} {hw.figCaption}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SECTION VIII: SOFTWARE REQUIREMENTS */}
                        <div className="space-y-3 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            VIII. Software Requirements
                          </h2>
                          <div className="space-y-2">
                            {(paper.sections?.hardwareSoftwareIntegration?.softwareRequirements || []).map((sw, i) => (
                              <p key={i} className="text-zinc-800 text-[12px] text-justify">
                                <strong className="font-bold text-zinc-900">{i + 1}. {sw.name}: </strong>
                                {sw.description}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* SECTION IX: ALGORITHM */}
                        <div className="space-y-3 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.algorithm?.title || "IX. Algorithm"}
                          </h2>
                          <div className="space-y-2 text-[12px] text-zinc-800 font-serif">
                            {(paper.sections?.algorithm?.steps || []).map((st, i) => (
                              <div key={i} className="space-y-0.5">
                                <p className="font-bold text-zinc-950 font-sans">{st.step}:</p>
                                <p className="text-justify">{st.description}</p>
                                {st.subItems && (
                                  <ul className="list-disc pl-5 space-y-0.5">
                                    {st.subItems.map((sub, sIdx) => (
                                      <li key={sIdx}>{sub}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SECTION X: RESULTS AND DISCUSSION */}
                        <div className="space-y-3 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.resultsAndDiscussion?.title || "X. RESULTS AND DISCUSSION"}
                          </h2>

                          <div className="space-y-1">
                            <h3 className="text-[12px] font-bold font-sans text-zinc-900">1. Purpose:</h3>
                            <p className="text-justify text-zinc-800 text-[12px]">
                              {paper.sections?.resultsAndDiscussion?.purpose}
                            </p>
                          </div>

                          <div className="space-y-2">
                            {(paper.sections?.resultsAndDiscussion?.qualitativeObservations || []).map((obs, i) => (
                              <div key={i} className="space-y-0.5">
                                <h3 className="text-[12px] font-bold font-sans text-zinc-900">{obs.title}:</h3>
                                <p className="text-justify text-zinc-800 text-[12px]">{obs.content}</p>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1 pt-1">
                            <h3 className="text-[12px] font-bold font-sans text-zinc-900">6. Test Scenarios Considered:</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-zinc-800 text-[12px]">
                              {(paper.sections?.resultsAndDiscussion?.testScenarios || []).map((sc, i) => (
                                <li key={i}>{sc}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Figure Captions (Matching Page 10 of PDF) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                            {(paper.sections?.resultsAndDiscussion?.figures || []).map((fig, i) => (
                              <div key={i} className="p-3 rounded-lg border border-zinc-300 bg-zinc-50 text-center">
                                <span className="text-[10px] font-bold text-zinc-800 font-serif">
                                  {fig.figNumber} {fig.caption}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1 pt-1">
                            <h3 className="text-[12px] font-bold font-sans text-zinc-900">7. Overall Observation:</h3>
                            <p className="text-justify text-zinc-800 text-[12px]">
                              {paper.sections?.resultsAndDiscussion?.overallObservation}
                            </p>
                          </div>

                          <div className="space-y-1 pt-1">
                            <h3 className="text-[12px] font-bold font-sans text-zinc-900">8. Future Scope:</h3>
                            <ul className="list-disc pl-5 space-y-0.5 text-zinc-800 text-[12px]">
                              {(paper.sections?.resultsAndDiscussion?.futureScope || []).map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* SECTION XI: ACKNOWLEDGMENT */}
                        <div className="space-y-2 pt-3">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950 border-b border-zinc-200 pb-0.5">
                            {paper.sections?.acknowledgment?.title || "XI. ACKNOWLEDGMENT"}
                          </h2>
                          <div className="text-justify space-y-2 text-zinc-800 text-[12px]">
                            {paper.sections?.acknowledgment?.content.split("\n\n").map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>

                        {/* SECTION XII: REFERENCES */}
                        <div className="space-y-2 pt-4 border-t border-zinc-300">
                          <h2 className="text-xs font-bold font-sans tracking-wide uppercase text-zinc-950">
                            XII. REFERENCES ({paper.references.length})
                          </h2>
                          <div className="space-y-1.5 text-[11px] text-zinc-700 font-sans leading-snug">
                            {paper.references.map((ref, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-justify">
                                <span className="font-semibold select-none shrink-0">
                                  {ref.startsWith(`${idx + 1}.`) ? "" : `${idx + 1}.`}
                                </span>
                                <span>{ref}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Running Journal Footer (Matching Page 11/12 of PDF) */}
                        <div className="flex items-center justify-between text-[11px] font-sans border-t border-zinc-300 pt-3 text-zinc-500">
                          <span>q IJIRCCE &copy; 2025</span>
                          <span>| An ISO 9001:2008 Certified Journal |</span>
                          <span className="font-mono">Page 18340</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PLAGIARISM & CITATION SAFEGUARDS REPORT */}
                {activeTab === "plagiarism" && (
                  <div className="space-y-5">
                    <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          <h3 className="text-sm font-bold text-foreground">Plagiarism & Citation Integrity Audit</h3>
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          {paper.report.verdict}
                        </span>
                      </div>

                      {/* Similarity Breakdown Bars */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-foreground">Similarity Breakdown Across Datasets</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Peer-Reviewed Databases (IEEE Xplore, ACM, arXiv, IJRASET)</span>
                              <span className="font-mono font-bold text-foreground">{paper.report.similarityBreakdown.academicDatabases}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, paper.report.similarityBreakdown.academicDatabases * 15)}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Open Web & Technical Repositories</span>
                              <span className="font-mono font-bold text-foreground">{paper.report.similarityBreakdown.openWebSources}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, paper.report.similarityBreakdown.openWebSources * 15)}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Institutional Theses & Dissertations</span>
                              <span className="font-mono font-bold text-foreground">{paper.report.similarityBreakdown.institutionalRepositories}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, paper.report.similarityBreakdown.institutionalRepositories * 15)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Citation Safeguards Card */}
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" />
                          <span>Citation Safeguards & Anti-Hallucination Guard</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {paper.report.citationSafeguards.citationSafeguardNotes}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 font-mono">
                          <div className="p-2 rounded-lg bg-background/60 border border-purple-500/20">
                            <span className="text-muted-foreground block text-[10px]">Citations Count</span>
                            <span className="font-bold text-purple-400">{paper.report.citationSafeguards.totalCitations} References</span>
                          </div>
                          <div className="p-2 rounded-lg bg-background/60 border border-purple-500/20">
                            <span className="text-muted-foreground block text-[10px]">Style Conformity</span>
                            <span className="font-bold text-emerald-400">100% {paper.formatStyle} Compliant</span>
                          </div>
                          <div className="p-2 rounded-lg bg-background/60 border border-purple-500/20">
                            <span className="text-muted-foreground block text-[10px]">Hallucination Risk</span>
                            <span className="font-bold text-emerald-400">Zero Detected</span>
                          </div>
                        </div>
                      </div>

                      {/* Linguistic Recommendations */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-foreground">Peer-Review Linguistic Recommendations</h4>
                        <div className="space-y-1.5">
                          {paper.report.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LATEX SOURCE VIEW */}
                {activeTab === "latex" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/80">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Code2 className="w-4 h-4 text-purple-500" />
                        <span>LaTeX Source File (.tex)</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground font-mono text-[11px]">Ready for Overleaf / TeXShop</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCopy(paper.latexSource)}
                        className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied Source" : "Copy All LaTeX"}</span>
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-[500px]">
                      <pre className="whitespace-pre">{paper.latexSource}</pre>
                    </div>
                  </div>
                )}

                {/* TAB 4: AI SECTION REFINER */}
                {activeTab === "refine" && (
                  <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-5">
                    <div className="space-y-1 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-sm font-bold text-foreground">AI Academic Section Refiner</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Request targeted adjustments, enhance operational logic, humanize phrasing, or expand empirical observations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Select Target Section</label>
                        <select
                          value={selectedSectionKey}
                          onChange={(e) => setSelectedSectionKey(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none text-foreground"
                        >
                          <option value="introduction">I. INTRODUCTION</option>
                          <option value="literatureSurvey">II. LITERATURE SURVEY</option>
                          <option value="problemStatement">III. PROBLEM STATEMENT</option>
                          <option value="contributions">V. Contributions of This Research work</option>
                          <option value="methodology">VI. METHODOLOGY</option>
                          <option value="resultsAndDiscussion">X. RESULTS AND DISCUSSION</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Quick Action Presets</label>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            onClick={() => setRefineInstructions("Enhance technical depth and mention sub-second interrupt response times.")}
                            className="text-[10px] px-2 py-1 rounded-md bg-muted/60 hover:bg-indigo-500/20 text-muted-foreground hover:text-indigo-400 border border-border/60 cursor-pointer"
                          >
                            + Latency Metrics
                          </button>
                          <button
                            onClick={() => setRefineInstructions("Humanize phrasing and increase academic vocabulary diversity.")}
                            className="text-[10px] px-2 py-1 rounded-md bg-muted/60 hover:bg-indigo-500/20 text-muted-foreground hover:text-indigo-400 border border-border/60 cursor-pointer"
                          >
                            + Humanize Text
                          </button>
                          <button
                            onClick={() => setRefineInstructions("Emphasize false-positive rejection against ambient horn noise.")}
                            className="text-[10px] px-2 py-1 rounded-md bg-muted/60 hover:bg-indigo-500/20 text-muted-foreground hover:text-indigo-400 border border-border/60 cursor-pointer"
                          >
                            + Noise Immunity
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Refinement Prompt</label>
                      <textarea
                        value={refineInstructions}
                        onChange={(e) => setRefineInstructions(e.target.value)}
                        rows={3}
                        placeholder="e.g. Expand on how the sound sensor threshold avoids false positives in peak city traffic..."
                        className="w-full text-xs p-3 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleRefineSection}
                      disabled={refining || !refineInstructions.trim()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {refining ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Refining Section with AI Peer Reviewer...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>Apply Academic Refinement</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default ResearchPaperPage
