import { Request, Response } from "express"
import bcrypt from "bcrypt"
import prisma from "../utils/prisma"
import { registerSchema } from "../validators/authValidator"

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const { name, email, password } = parsed.data

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return res.status(201).json({
      message: "Account created successfully",
      user,
    })
  } catch (error) {
    console.error("REGISTER ERROR DETAILS:", error)
    return res.status(500).json({ message: "Something went wrong during registration" })
  }
}
