import { Request, Response } from "express"
import aiChatService from "../services/ai/aiChatService"

export async function sendChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id || ""

    const { message, history, useResumeContext } = req.body
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Message is required" })
      return
    }

    const result = await aiChatService.processChatMessage(
      userId,
      message.trim(),
      Array.isArray(history) ? history : [],
      useResumeContext !== false
    )

    res.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("sendChatMessage error:", error)
    res.status(500).json({ error: error.message || "Failed to process chat message" })
  }
}
