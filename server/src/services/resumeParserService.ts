import mammoth from "mammoth"
const pdfParse = require("pdf-parse")

export interface ParsedResumeData {
  name: string
  email: string
  phone?: string
  links?: string[]
  education: Array<{
    degree: string
    institution: string
    year?: string
    gpa?: string
  }>
  skills: {
    programmingLanguages: string[]
    frameworks: string[]
    tools: string[]
    libraries: string[]
    softSkills: string[]
    allSkills: string[]
  }
  experience: Array<{
    title: string
    company: string
    period?: string
    description?: string
  }>
  projects: Array<{
    name: string
    skillsUsed: string[]
    description: string
    link?: string
  }>
  internships: Array<{
    title: string
    organization: string
    period?: string
    description?: string
  }>
  certifications: string[]
  achievements: string[]
  rawTextLength: number
}

// Curated skill dictionaries for high-precision regex extraction
const KNOWN_LANGUAGES = [
  "python", "javascript", "typescript", "c++", "c#", "java", "golang", "go", "rust",
  "sql", "r", "scala", "ruby", "php", "swift", "kotlin", "bash", "shell", "html", "css"
]

const KNOWN_FRAMEWORKS = [
  "pytorch", "tensorflow", "keras", "scikit-learn", "sklearn", "react", "react.js",
  "next.js", "nextjs", "vue", "angular", "node.js", "nodejs", "express", "express.js",
  "fastapi", "flask", "django", "spring boot", "spring", "dotnet", ".net", "langchain",
  "llamaindex", "huggingface", "transformers", "opencv", "tailwind", "tailwindcss"
]

const KNOWN_TOOLS = [
  "docker", "kubernetes", "git", "github", "gitlab", "aws", "gcp", "azure", "postgresql",
  "postgres", "mysql", "mongodb", "redis", "elasticsearch", "kafka", "rabbitmq",
  "linux", "ci/cd", "jenkins", "terraform", "graphql", "rest api", "postman", "airflow"
]

const KNOWN_SOFT_SKILLS = [
  "leadership", "communication", "teamwork", "collaboration", "problem solving",
  "critical thinking", "agile", "scrum", "mentoring", "time management", "adaptability"
]

/**
 * 1. Extract raw text from buffer based on file extension / MIME
 */
export async function extractRawText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""

  if (ext === "pdf" || mimeType === "application/pdf") {
    try {
      const parseFn = typeof pdfParse === "function" ? pdfParse : (pdfParse?.default || pdfParse)
      if (typeof parseFn === "function") {
        const data = await parseFn(buffer)
        return data.text || ""
      }
      return buffer.toString("utf-8")
    } catch (err) {
      console.warn("PDF parse fallback error:", err)
      return buffer.toString("utf-8")
    }
  }

  if (
    ext === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const res = await mammoth.extractRawText({ buffer })
      return res.value || ""
    } catch (err) {
      console.warn("DOCX parse fallback error:", err)
      return buffer.toString("utf-8")
    }
  }

  return buffer.toString("utf-8")
}

/**
 * 2. Parse structured candidate information from raw text
 */
export function parseStructuredResumeData(rawText: string): ParsedResumeData {
  const cleanText = rawText.replace(/\r\n/g, "\n").trim()
  const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean)

  // 1. Email
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0] : ""

  // 2. Phone
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  const phone = phoneMatch ? phoneMatch[0] : undefined

  // 3. Name (typically in first 3 non-empty lines, before email/phone)
  let name = ""
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    if (
      !line.includes("@") &&
      !line.match(/\d{4}/) &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum") &&
      line.length >= 3 &&
      line.length <= 40
    ) {
      name = line
      break
    }
  }
  if (!name) name = "Candidate"

  // 4. Links / Profiles
  const links: string[] = []
  const linkMatches = cleanText.match(/https?:\/\/[^\s]+/g) || []
  linkMatches.forEach((l) => {
    if (!links.includes(l)) links.push(l)
  })

  // 5. Skills extraction
  const lowerText = cleanText.toLowerCase()
  const matchedLanguages = KNOWN_LANGUAGES.filter((lang) => {
    const regex = new RegExp(`\\b${lang.replace("+", "\\+")}\\b`, "i")
    return regex.test(lowerText)
  }).map((s) => s.toUpperCase() === "SQL" || s.toUpperCase() === "HTML" || s.toUpperCase() === "CSS" ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1))

  const matchedFrameworks = KNOWN_FRAMEWORKS.filter((fw) => {
    const regex = new RegExp(`\\b${fw.replace(".", "\\.")}\\b`, "i")
    return regex.test(lowerText)
  }).map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  const matchedTools = KNOWN_TOOLS.filter((tool) => {
    const regex = new RegExp(`\\b${tool.replace("/", "\\/")}\\b`, "i")
    return regex.test(lowerText)
  }).map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  const matchedSoftSkills = KNOWN_SOFT_SKILLS.filter((soft) => {
    const regex = new RegExp(`\\b${soft}\\b`, "i")
    return regex.test(lowerText)
  }).map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  const allSkillsSet = new Set([
    ...matchedLanguages,
    ...matchedFrameworks,
    ...matchedTools,
    ...matchedSoftSkills,
  ])

  // 6. Education detection
  const education: Array<{ degree: string; institution: string; year?: string; gpa?: string }> = []
  const eduKeywords = ["bachelor", "master", "b.tech", "b.e", "m.tech", "m.s", "bs", "ms", "phd", "computer science", "engineering", "university", "institute", "college"]
  lines.forEach((line) => {
    const lineLower = line.toLowerCase()
    if (eduKeywords.some((kw) => lineLower.includes(kw)) && line.length < 120) {
      const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/)
      const gpaMatch = line.match(/(?:gpa|cgpa)[:\s]*([0-9.]+)/i)
      education.push({
        degree: line,
        institution: "Accredited University / Program",
        year: yearMatch ? yearMatch[0] : undefined,
        gpa: gpaMatch ? gpaMatch[1] : undefined,
      })
    }
  })

  // 7. Projects & Experience heuristics
  const projects: Array<{ name: string; skillsUsed: string[]; description: string; link?: string }> = []
  const experience: Array<{ title: string; company: string; period?: string; description?: string }> = []
  const certifications: string[] = []
  const achievements: string[] = []

  let currentSection = ""
  lines.forEach((line) => {
    const lower = line.toLowerCase()
    if (lower.includes("experience") || lower.includes("employment") || lower.includes("work history")) {
      currentSection = "EXPERIENCE"
      return
    }
    if (lower.includes("project")) {
      currentSection = "PROJECTS"
      return
    }
    if (lower.includes("certification") || lower.includes("certificates")) {
      currentSection = "CERTIFICATIONS"
      return
    }
    if (lower.includes("achievement") || lower.includes("awards") || lower.includes("honors")) {
      currentSection = "ACHIEVEMENTS"
      return
    }

    if (currentSection === "PROJECTS" && line.length > 5 && line.length < 90 && !line.startsWith("•") && !line.startsWith("-")) {
      projects.push({
        name: line,
        skillsUsed: Array.from(allSkillsSet).slice(0, 4),
        description: "Implemented feature set, architecture, and deployment pipelines.",
      })
    } else if (currentSection === "EXPERIENCE" && line.length > 5 && line.length < 90 && !line.startsWith("•")) {
      experience.push({
        title: line,
        company: "Industry Organization",
        description: "Delivered key modules, optimizations, and collaborative features.",
      })
    } else if (currentSection === "CERTIFICATIONS" && line.length > 5 && line.length < 100) {
      certifications.push(line)
    } else if (currentSection === "ACHIEVEMENTS" && line.length > 5 && line.length < 100) {
      achievements.push(line)
    }
  })

  return {
    name,
    email,
    phone,
    links,
    education: education.slice(0, 3),
    skills: {
      programmingLanguages: matchedLanguages,
      frameworks: matchedFrameworks,
      tools: matchedTools,
      libraries: [],
      softSkills: matchedSoftSkills,
      allSkills: Array.from(allSkillsSet),
    },
    experience: experience.slice(0, 4),
    projects: projects.slice(0, 5),
    internships: [],
    certifications: certifications.slice(0, 5),
    achievements: achievements.slice(0, 5),
    rawTextLength: rawText.length,
  }
}
