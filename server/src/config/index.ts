import { env } from "./env"
import { prisma, checkDatabaseConnection } from "./database"

export const config = env
export { env, prisma, checkDatabaseConnection }
export default config
