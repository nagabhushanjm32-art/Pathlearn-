import "dotenv/config"
import { Request, Response } from "express"
import prisma from "../utils/prisma"

export async function getAllDomains(req: Request, res: Response) {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { name: "asc" },
    })
    return res.status(200).json({ domains })
  } catch (error) {
    console.error("GET DOMAINS ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching domains" })
  }
}

export async function getDomainById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const domain = await prisma.domain.findUnique({ where: { id } })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    return res.status(200).json({ domain })
  } catch (error) {
    console.error("GET DOMAIN BY ID ERROR:", error)
    return res.status(500).json({ message: "Something went wrong fetching the domain" })
  }
}
