import { prisma } from "../config/database"
import { hashPassword, comparePassword } from "../utils/password"
import { signToken } from "../utils/jwt"
import { AppError } from "../middleware/errorMiddleware"
import { RegisterInput, LoginInput } from "../validators/authValidators"

export interface SafeUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  profile?: {
    id?: string
    avatarUrl?: string | null
    targetRole?: string | null
    level?: string | null
    goal?: string | null
    studyTimePerDay?: string | null
    onboardingCompleted?: boolean
  } | null
}

export class AuthService {
  /**
   * Register a new user with secure password hash and linked profile
   */
  async register(data: Omit<RegisterInput, "confirmPassword">): Promise<{ user: SafeUser; token: string }> {
    const { name, email, password } = data

    // 1. Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409)
    }

    // 2. Hash password using bcrypt
    const hashedPassword = await hashPassword(password)

    // 3. Create user in PostgreSQL with initial profile
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        profile: {
          create: {
            targetRole: "AI / ML Engineer",
            onboardingCompleted: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            avatarUrl: true,
            targetRole: true,
            level: true,
            goal: true,
            studyTimePerDay: true,
            onboardingCompleted: true,
          },
        },
      },
    })

    // 4. Generate authenticated JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user,
      token,
    }
  }

  /**
   * Authenticate user credentials and return safe user + token
   */
  async login(data: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const { email, password } = data

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        profile: {
          select: {
            id: true,
            avatarUrl: true,
            targetRole: true,
            level: true,
            goal: true,
            studyTimePerDay: true,
            onboardingCompleted: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError("Invalid email or password.", 401)
    }

    // 2. Compare password using bcrypt
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password.", 401)
    }

    // 3. Generate authenticated JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // 4. Safe user object (excluding password)
    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile,
    }

    return {
      user: safeUser,
      token,
    }
  }

  /**
   * Fetch current authenticated user by ID
   */
  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            avatarUrl: true,
            targetRole: true,
            level: true,
            goal: true,
            studyTimePerDay: true,
            onboardingCompleted: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError("User not found.", 404)
    }

    return user
  }
}

export const authService = new AuthService()
export default authService
