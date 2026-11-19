import { Request, Response } from "express"
import researchPaperService, { FormatStyle, AcademicLevel } from "../services/ai/researchPaperService"

export async function generateResearchPaper(req: Request, res: Response): Promise<void> {
  try {
    const {
      topic,
      domain = "Artificial Intelligence & Computer Science",
      formatStyle = "IEEE",
      academicLevel = "Master",
      customKeywords = [],
      additionalInstructions = "",
      authorName,
      affiliation,
    } = req.body

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      res.status(400).json({ error: "A research topic is required." })
      return
    }

    const userObj = (req as any).user
    const finalAuthorName = authorName || (userObj?.profile?.fullName || userObj?.username || "Researcher")
    const finalAffiliation = affiliation || "Department of Advanced Computing & Research, PathLearn Academy"

    const paper = await researchPaperService.generatePaper(
      {
        topic: topic.trim(),
        domain,
        formatStyle: formatStyle as FormatStyle,
        academicLevel: academicLevel as AcademicLevel,
        customKeywords: Array.isArray(customKeywords) ? customKeywords : [],
        additionalInstructions,
      },
      finalAuthorName,
      finalAffiliation
    )

    res.json({
      success: true,
      paper,
    })
  } catch (error: any) {
    console.error("generateResearchPaper controller error:", error)
    res.status(500).json({ error: error.message || "Failed to generate research paper" })
  }
}

export async function scanPaperPlagiarism(req: Request, res: Response): Promise<void> {
  try {
    const { paper, formatStyle = "IEEE" } = req.body
    if (!paper) {
      res.status(400).json({ error: "Paper object or content is required." })
      return
    }

    const report = researchPaperService.generatePlagiarismReport(paper, formatStyle as FormatStyle)
    res.json({
      success: true,
      report,
    })
  } catch (error: any) {
    console.error("scanPaperPlagiarism error:", error)
    res.status(500).json({ error: error.message || "Failed to scan plagiarism" })
  }
}

export async function refinePaperSection(req: Request, res: Response): Promise<void> {
  try {
    const { sectionKey, currentContent, instructions, topic } = req.body
    if (!sectionKey || !currentContent || !instructions) {
      res.status(400).json({ error: "sectionKey, currentContent, and instructions are required." })
      return
    }

    const result = await researchPaperService.refineSection(
      sectionKey,
      currentContent,
      instructions,
      topic || "Academic Research"
    )

    res.json({
      success: true,
      refinedContent: result.refinedContent,
    })
  } catch (error: any) {
    console.error("refinePaperSection error:", error)
    res.status(500).json({ error: error.message || "Failed to refine section" })
  }
}
