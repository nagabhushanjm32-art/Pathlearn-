import { Request, Response } from "express"
import dsaService from "../services/dsaService"

export async function getDsaProblems(_req: Request, res: Response): Promise<void> {
  try {
    const problems = dsaService.getProblems()
    res.json({
      success: true,
      problems,
    })
  } catch (error: any) {
    console.error("getDsaProblems error:", error)
    res.status(500).json({ error: error.message || "Failed to fetch DSA problems" })
  }
}

export async function getDsaProblemById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string
    const problem = dsaService.getProblemBySlugOrId(id)
    if (!problem) {
      res.status(404).json({ error: "Problem not found" })
      return
    }

    res.json({
      success: true,
      problem,
    })
  } catch (error: any) {
    console.error("getDsaProblemById error:", error)
    res.status(500).json({ error: error.message || "Failed to fetch problem" })
  }
}

export async function runDsaCode(req: Request, res: Response): Promise<void> {
  try {
    const { problemId, code, language } = req.body
    if (!problemId || !code || !language) {
      res.status(400).json({ error: "problemId, code, and language are required" })
      return
    }

    const evaluation = await dsaService.evaluateCode(problemId, code, language, false)
    res.json({
      success: true,
      ...evaluation,
    })
  } catch (error: any) {
    console.error("runDsaCode error:", error)
    res.status(500).json({ error: error.message || "Failed to run code" })
  }
}

export async function submitDsaCode(req: Request, res: Response): Promise<void> {
  try {
    const { problemId, code, language } = req.body
    if (!problemId || !code || !language) {
      res.status(400).json({ error: "problemId, code, and language are required" })
      return
    }

    const evaluation = await dsaService.evaluateCode(problemId, code, language, true)
    res.json({
      success: true,
      ...evaluation,
    })
  } catch (error: any) {
    console.error("submitDsaCode error:", error)
    res.status(500).json({ error: error.message || "Failed to submit code" })
  }
}
