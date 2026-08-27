import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchNotes, type Note } from "../services/notes"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import {
  ArrowLeft,
  Copy,
  Check,
  BookMarked,
  Lightbulb,
  Code2,
  AlertTriangle,
  Briefcase,
  Zap,
  Star,
  Download,
} from "lucide-react"

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function NotesPage() {
  const { stepId } = useParams<{ stepId: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (!stepId) return
    fetchNotes(stepId)
      .then(setNote)
      .catch(() => setError("Could not load notes"))
      .finally(() => setLoading(false))
  }, [stepId])

  function buildPlainText(): string {
    if (!note) return ""
    const c = note.content
    const lines: string[] = []
    lines.push("SUMMARY")
    lines.push(c.summary)
    lines.push("")
    lines.push("KEY CONCEPTS")
    c.keyConcepts.forEach(function (k) { lines.push("- " + k) })
    lines.push("")
    lines.push("DEFINITIONS")
    c.definitions.forEach(function (d) { lines.push(d.term + ": " + d.definition) })
    lines.push("")
    lines.push("EXAMPLES")
    c.examples.forEach(function (e) { lines.push("- " + e) })
    lines.push("")
    lines.push("COMMON MISTAKES")
    c.commonMistakes.forEach(function (m) { lines.push("- " + m) })
    lines.push("")
    lines.push("INTERVIEW TIPS")
    c.interviewTips.forEach(function (t) { lines.push("- " + t) })
    lines.push("")
    lines.push("QUICK REVISION")
    c.quickRevision.forEach(function (q) { lines.push("- " + q) })
    lines.push("")
    lines.push("5 IMPORTANT TAKEAWAYS")
    c.takeaways.forEach(function (t, i) { lines.push((i + 1) + ". " + t) })
    return lines.join("\n")
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPlainText())
    setCopied(true)
    setTimeout(function () { setCopied(false) }, 2000)
  }

  function handleDownloadPDF() {
    if (!note) return
    const c = note.content
    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 50
    const maxWidth = pageWidth - margin * 2
    let y = 60

    function addPageIfNeeded() {
      if (y > 780) {
        doc.addPage()
        y = 60
      }
    }

    function heading(text: string) {
      addPageIfNeeded()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(20, 20, 20)
      doc.text(text, margin, y)
      y += 20
    }

    function paragraph(text: string) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10.5)
      doc.setTextColor(60, 60, 60)
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach(function (line: string) {
        addPageIfNeeded()
        doc.text(line, margin, y)
        y += 15
      })
      y += 8
    }

    function bulletList(items: string[]) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10.5)
      doc.setTextColor(60, 60, 60)
      items.forEach(function (item) {
        const lines = doc.splitTextToSize("-  " + item, maxWidth - 10)
        lines.forEach(function (line: string) {
          addPageIfNeeded()
          doc.text(line, margin + 5, y)
          y += 15
        })
      })
      y += 8
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text("PathLearn Study Notes", margin, y)
    y += 35

    heading("Summary")
    paragraph(c.summary)

    heading("Key Concepts")
    bulletList(c.keyConcepts)

    heading("Definitions")
    c.definitions.forEach(function (d) { paragraph(d.term + ": " + d.definition) })

    heading("Examples")
    bulletList(c.examples)

    heading("Common Mistakes")
    bulletList(c.commonMistakes)

    heading("Interview Tips")
    bulletList(c.interviewTips)

    heading("Quick Revision")
    bulletList(c.quickRevision)

    heading("5 Important Takeaways")
    bulletList(c.takeaways.map(function (t, i) { return (i + 1) + ". " + t }))

    doc.save("PathLearn-Notes.pdf")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-neutral-500 text-sm">Generating your notes...</p>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error || "Notes not found"}</p>
      </div>
    )
  }

  const content = note.content

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to roadmap
          </button>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={bookmarked ? "default" : "secondary"}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <BookMarked className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8">
          <Section icon={Lightbulb} title="Summary">
            <p className="text-neutral-200 leading-relaxed">{content.summary}</p>
          </Section>

          <Section icon={Star} title="Key Concepts">
            <div className="flex flex-wrap gap-2">
              {content.keyConcepts.map((concept, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200"
                >
                  {concept}
                </span>
              ))}
            </div>
          </Section>

          <Section icon={Code2} title="Definitions">
            <div className="space-y-3">
              {content.definitions.map((def, i) => (
                <div key={i} className="border-l-2 border-neutral-700 pl-4">
                  <p className="font-medium text-white text-sm mb-0.5">{def.term}</p>
                  <p className="text-sm text-neutral-400">{def.definition}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Code2} title="Examples">
            <div className="space-y-2">
              {content.examples.map((ex, i) => (
                <div key={i} className="bg-black border border-neutral-800 rounded-lg p-3 font-mono text-sm text-neutral-300">
                  {ex}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={AlertTriangle} title="Common Mistakes">
            <ul className="space-y-2">
              {content.commonMistakes.map((mistake, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2">
                  <span className="text-yellow-500 font-bold">!</span> {mistake}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Briefcase} title="Interview Tips">
            <ul className="space-y-2">
              {content.interviewTips.map((tip, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2">
                  <span className="text-blue-400 font-bold">TIP</span> {tip}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Zap} title="Quick Revision">
            <ul className="space-y-1.5">
              {content.quickRevision.map((point, i) => (
                <li key={i} className="text-sm text-neutral-400 flex gap-2">
                  <span className="text-neutral-600">-</span> {point}
                </li>
              ))}
            </ul>
          </Section>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">
                5 Important Takeaways
              </h3>
            </div>
            <div className="space-y-2">
              {content.takeaways.map((takeaway, i) => (
                <div key={i} className="flex items-start gap-3 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-200">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
