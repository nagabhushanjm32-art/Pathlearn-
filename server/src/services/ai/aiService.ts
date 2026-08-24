import "dotenv/config"
import { GoogleGenAI } from "@google/genai"

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string })

export async function generateJSON(prompt: string): Promise<string> {
  const response = await genAI.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  })

  const text = response.text

  if (!text) {
    throw new Error("Empty response from AI model")
  }

  return text
}
