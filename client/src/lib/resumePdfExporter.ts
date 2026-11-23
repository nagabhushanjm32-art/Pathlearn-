import { jsPDF } from "jspdf"
import { ResumeData } from "../services/resumeBuilderService"

/**
 * Generates and downloads a clean, professional ATS-compliant PDF resume directly to the user's files.
 */
export function exportResumeToPdf(resume: ResumeData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  const bottomLimit = 280
  let y = 15

  // Helper to handle multi-page overflow
  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage()
      y = 15
    }
  }

  // Section Header
  const renderSectionHeader = (title: string) => {
    ensureSpace(12)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(24, 24, 27) // zinc-900
    doc.text(title.toUpperCase(), margin, y)

    doc.setDrawColor(200, 200, 205)
    doc.setLineWidth(0.35)
    doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5)
    y += 6
  }

  // Helper for bullet lines
  const renderBullet = (text: string) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(55, 65, 81)
    const bulletLines = doc.splitTextToSize(text, contentWidth - 6)
    bulletLines.forEach((bLine: string, bIdx: number) => {
      ensureSpace(4.5)
      if (bIdx === 0) {
        doc.text("•", margin + 1.5, y)
        doc.text(bLine, margin + 5.5, y)
      } else {
        doc.text(bLine, margin + 5.5, y)
      }
      y += 4.2
    })
  }

  // 1. Header (Personal Info)
  const personalInfo = resume.personalInfo || ({} as any)
  const fullName = (personalInfo.fullName || "Your Name").toUpperCase()
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text(fullName, pageWidth / 2, y, { align: "center" })
  y += 6

  const title = (personalInfo.professionalTitle || resume.targetRole || "").toUpperCase()
  if (title) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(79, 70, 229) // indigo-600
    doc.text(title, pageWidth / 2, y, { align: "center" })
    y += 5
  }

  // Contact line items
  const contacts: string[] = []
  if (personalInfo.email) contacts.push(personalInfo.email)
  if (personalInfo.phone) contacts.push(personalInfo.phone)
  if (personalInfo.location) contacts.push(personalInfo.location)
  if (personalInfo.linkedIn) {
    contacts.push(personalInfo.linkedIn.replace(/^https?:\/\/(www\.)?/, ""))
  }
  if (personalInfo.github) {
    contacts.push(personalInfo.github.replace(/^https?:\/\/(www\.)?/, ""))
  }
  if (personalInfo.portfolio) {
    contacts.push(personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, ""))
  }

  if (contacts.length > 0) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)

    const contactStr = contacts.join("  •  ")
    const wrappedContacts = doc.splitTextToSize(contactStr, contentWidth)
    wrappedContacts.forEach((cLine: string) => {
      doc.text(cLine, pageWidth / 2, y, { align: "center" })
      y += 4
    })
  }

  y += 1
  doc.setDrawColor(180, 185, 195)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // 2. Professional Summary
  if (resume.summary && resume.summary.trim()) {
    renderSectionHeader("Professional Summary")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth)
    summaryLines.forEach((sLine: string) => {
      ensureSpace(4.5)
      doc.text(sLine, margin, y)
      y += 4.2
    })
    y += 3
  }

  // 3. Technical Skills
  const skills = resume.technicalSkills || {
    languages: [],
    frameworks: [],
    databases: [],
    cloudTechnologies: [],
    tools: [],
    aiMlTechnologies: [],
    other: [],
  }
  const hasSkills =
    (skills.languages && skills.languages.length > 0) ||
    (skills.frameworks && skills.frameworks.length > 0) ||
    (skills.databases && skills.databases.length > 0) ||
    (skills.cloudTechnologies && skills.cloudTechnologies.length > 0) ||
    (skills.tools && skills.tools.length > 0) ||
    (skills.aiMlTechnologies && skills.aiMlTechnologies.length > 0)

  if (hasSkills) {
    renderSectionHeader("Technical Skills")

    const renderSkillRow = (category: string, list: string[]) => {
      if (!list || list.length === 0) return
      ensureSpace(5)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)
      const prefix = `${category}: `
      doc.text(prefix, margin, y)
      const prefixWidth = doc.getTextWidth(prefix)

      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      const valueStr = list.join(", ")
      const wrappedValues = doc.splitTextToSize(valueStr, contentWidth - prefixWidth)

      if (wrappedValues.length > 0) {
        doc.text(wrappedValues[0], margin + prefixWidth, y)
        y += 4.2
        for (let i = 1; i < wrappedValues.length; i++) {
          ensureSpace(4.5)
          doc.text(wrappedValues[i], margin + prefixWidth, y)
          y += 4.2
        }
      }
    }

    renderSkillRow("Languages", skills.languages)
    renderSkillRow("Frameworks & Libraries", skills.frameworks)
    renderSkillRow("Databases", skills.databases)
    renderSkillRow("Cloud & DevOps", skills.cloudTechnologies)
    renderSkillRow("Developer Tools", skills.tools)
    renderSkillRow("AI / Machine Learning", skills.aiMlTechnologies)
    y += 3
  }

  // 4. Experience
  if (resume.experience && resume.experience.length > 0) {
    renderSectionHeader("Professional Experience")

    resume.experience.forEach((exp) => {
      ensureSpace(12)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      doc.text(exp.role || "Software Engineer", margin, y)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(100, 116, 139)
      if (exp.duration) {
        doc.text(exp.duration, pageWidth - margin, y, { align: "right" })
      }
      y += 4

      doc.setFont("helvetica", "italic")
      doc.setFontSize(9)
      doc.setTextColor(51, 65, 85)
      const orgLine = exp.organization + (exp.location ? ` — ${exp.location}` : "")
      doc.text(orgLine, margin, y)
      y += 4.5

      if (exp.responsibilities && exp.responsibilities.length > 0) {
        exp.responsibilities.forEach((resp) => renderBullet(resp))
      }
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((ach) => renderBullet(ach))
      }
      y += 2
    })
    y += 1
  }

  // 5. Projects
  if (resume.projects && resume.projects.length > 0) {
    renderSectionHeader("Technical Projects")

    resume.projects.forEach((proj) => {
      ensureSpace(12)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      doc.text(proj.title || "Project", margin, y)

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(8.5)
        doc.setTextColor(79, 70, 229) // indigo-600
        const techStr = ` [${proj.technologies.join(", ")}]`
        doc.text(techStr, margin + doc.getTextWidth(proj.title || "Project") + 1.5, y)
      }

      if (proj.githubUrl || proj.demoUrl) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(100, 116, 139)
        const linkStr = (proj.demoUrl || proj.githubUrl || "").replace(/^https?:\/\/(www\.)?/, "")
        doc.text(linkStr.slice(0, 45), pageWidth - margin, y, { align: "right" })
      }
      y += 4.2

      if (proj.description) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        doc.setTextColor(71, 85, 105)
        const descLines = doc.splitTextToSize(proj.description, contentWidth - 4)
        descLines.forEach((dLine: string) => {
          ensureSpace(4)
          doc.text(dLine, margin + 2, y)
          y += 3.8
        })
      }

      if (proj.bulletPoints && proj.bulletPoints.length > 0) {
        proj.bulletPoints.forEach((bp) => renderBullet(bp))
      }
      y += 2
    })
    y += 1
  }

  // 6. Education
  if (resume.education && resume.education.length > 0) {
    renderSectionHeader("Education")

    resume.education.forEach((edu) => {
      ensureSpace(10)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      const degreeStr = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : "")
      doc.text(degreeStr, margin, y)

      const yr = (edu.startYear ? `${edu.startYear} - ` : "") + (edu.endYear || "")
      if (yr.trim()) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        doc.setTextColor(100, 116, 139)
        doc.text(yr, pageWidth - margin, y, { align: "right" })
      }
      y += 4

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(51, 65, 85)
      const instStr = edu.institution + (edu.cgpaOrPercentage ? `  •  Score/CGPA: ${edu.cgpaOrPercentage}` : "")
      doc.text(instStr, margin, y)
      y += 5
    })
    y += 1
  }

  // 7. Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    renderSectionHeader("Certifications")

    resume.certifications.forEach((cert) => {
      ensureSpace(8)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(`• ${cert.name}`, margin + 1.5, y)

      const certNameWidth = doc.getTextWidth(`• ${cert.name}`)
      if (cert.issuingOrganization) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        doc.setTextColor(100, 116, 139)
        doc.text(` — ${cert.issuingOrganization}`, margin + 1.5 + certNameWidth, y)
      }

      if (cert.issueDate) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        doc.setTextColor(100, 116, 139)
        doc.text(cert.issueDate, pageWidth - margin, y, { align: "right" })
      }
      y += 4.5
    })
    y += 1
  }

  // 8. Achievements
  if (resume.achievements && resume.achievements.length > 0) {
    renderSectionHeader("Key Achievements")

    resume.achievements.forEach((ach) => {
      ensureSpace(8)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(`• ${ach.title}`, margin + 1.5, y)
      y += 4

      if (ach.description) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8.5)
        doc.setTextColor(71, 85, 105)
        const achLines = doc.splitTextToSize(ach.description, contentWidth - 6)
        achLines.forEach((aLine: string) => {
          ensureSpace(4)
          doc.text(aLine, margin + 5.5, y)
          y += 3.8
        })
      }
    })
  }

  // Trigger real file download directly to the user's computer
  const cleanName = ((personalInfo.fullName || "Resume"))
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
  doc.save(`${cleanName}_Resume.pdf`)
}

/**
 * Downloads resume as a plain text file (.txt), perfect for ATS text-input submission
 */
export function exportResumeToTxt(resume: ResumeData): void {
  const lines: string[] = []
  const separator = "=".repeat(60)
  const subSeparator = "-".repeat(60)

  const personalInfo = resume.personalInfo || ({} as any)

  // Header
  lines.push((personalInfo.fullName || "YOUR NAME").toUpperCase())
  if (personalInfo.professionalTitle || resume.targetRole) {
    lines.push(personalInfo.professionalTitle || resume.targetRole)
  }
  const contacts: string[] = []
  if (personalInfo.email) contacts.push(personalInfo.email)
  if (personalInfo.phone) contacts.push(personalInfo.phone)
  if (personalInfo.location) contacts.push(personalInfo.location)
  if (personalInfo.linkedIn) contacts.push(personalInfo.linkedIn)
  if (personalInfo.github) contacts.push(personalInfo.github)
  if (personalInfo.portfolio) contacts.push(personalInfo.portfolio)
  if (contacts.length > 0) lines.push(contacts.join(" | "))
  lines.push("")

  // Summary
  if (resume.summary) {
    lines.push(separator)
    lines.push("PROFESSIONAL SUMMARY")
    lines.push(subSeparator)
    lines.push(resume.summary.trim())
    lines.push("")
  }

  // Skills
  const skills = resume.technicalSkills || {
    languages: [],
    frameworks: [],
    databases: [],
    cloudTechnologies: [],
    tools: [],
    aiMlTechnologies: [],
    other: [],
  }
  lines.push(separator)
  lines.push("TECHNICAL SKILLS")
  lines.push(subSeparator)
  if (skills.languages?.length) lines.push(`Programming Languages: ${skills.languages.join(", ")}`)
  if (skills.frameworks?.length) lines.push(`Frameworks & Libraries: ${skills.frameworks.join(", ")}`)
  if (skills.databases?.length) lines.push(`Databases: ${skills.databases.join(", ")}`)
  if (skills.cloudTechnologies?.length) lines.push(`Cloud & DevOps: ${skills.cloudTechnologies.join(", ")}`)
  if (skills.tools?.length) lines.push(`Tools & Platforms: ${skills.tools.join(", ")}`)
  if (skills.aiMlTechnologies?.length) lines.push(`AI / ML: ${skills.aiMlTechnologies.join(", ")}`)
  lines.push("")

  // Experience
  if (resume.experience?.length) {
    lines.push(separator)
    lines.push("PROFESSIONAL EXPERIENCE")
    lines.push(subSeparator)
    resume.experience.forEach((exp) => {
      lines.push(`${exp.role} | ${exp.organization} ${exp.location ? `(${exp.location})` : ""}`)
      if (exp.duration) lines.push(`Duration: ${exp.duration}`)
      exp.responsibilities?.forEach((r) => lines.push(`  * ${r}`))
      exp.achievements?.forEach((a) => lines.push(`  * ${a}`))
      lines.push("")
    })
  }

  // Projects
  if (resume.projects?.length) {
    lines.push(separator)
    lines.push("PROJECTS")
    lines.push(subSeparator)
    resume.projects.forEach((proj) => {
      lines.push(`${proj.title} ${proj.technologies?.length ? `[${proj.technologies.join(", ")}]` : ""}`)
      if (proj.githubUrl) lines.push(`GitHub: ${proj.githubUrl}`)
      if (proj.demoUrl) lines.push(`Demo: ${proj.demoUrl}`)
      if (proj.description) lines.push(`  ${proj.description}`)
      proj.bulletPoints?.forEach((b) => lines.push(`  * ${b}`))
      lines.push("")
    })
  }

  // Education
  if (resume.education?.length) {
    lines.push(separator)
    lines.push("EDUCATION")
    lines.push(subSeparator)
    resume.education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.fieldOfStudy} | ${edu.institution}`)
      if (edu.endYear) lines.push(`Year: ${edu.startYear ? `${edu.startYear} - ` : ""}${edu.endYear}`)
      if (edu.cgpaOrPercentage) lines.push(`Score / CGPA: ${edu.cgpaOrPercentage}`)
      lines.push("")
    })
  }

  // Certifications
  if (resume.certifications?.length) {
    lines.push(separator)
    lines.push("CERTIFICATIONS")
    lines.push(subSeparator)
    resume.certifications.forEach((cert) => {
      lines.push(`* ${cert.name} - ${cert.issuingOrganization} (${cert.issueDate})`)
    })
    lines.push("")
  }

  const textContent = lines.join("\n")
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const cleanName = (personalInfo.fullName || "Resume")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
  a.href = url
  a.download = `${cleanName}_Resume.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
