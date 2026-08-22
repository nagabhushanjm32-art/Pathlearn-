import "dotenv/config"
import { Request, Response } from "express"
import bcrypt from "bcrypt"
import prisma from "../utils/prisma"
import { registerSchema, loginSchema } from "../validators/authValidator"
import { signToken } from "../utils/jwt"
import { AuthRequest } from "../middleware/authenticate"

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

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const { email, password } = parsed.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = signToken({ userId: user.id, role: user.role })

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("LOGIN ERROR DETAILS:", error)
    return res.status(500).json({ message: "Something went wrong during login" })
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error("GET ME ERROR DETAILS:", error)
    return res.status(500).json({ message: "Something went wrong" })
  }
}
