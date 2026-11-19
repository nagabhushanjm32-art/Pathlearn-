import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "./env"

const adapter = new PrismaPg({ connectionString: env.databaseUrl })
export const prisma = new PrismaClient({ adapter })

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

export default prisma
