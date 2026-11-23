import api from "./api"
import { UserProfile } from "../types"
import { currentUser as defaultMockUser } from "../data/user"

export interface AuthResponse {
  message?: string
  token?: string
  user: {
    id: string
    name: string
    email: string
    role?: string
    createdAt?: string
    profile?: {
      avatarUrl?: string | null
      targetRole?: string | null
      level?: string | null
      goal?: string | null
      studyTimePerDay?: string | null
      onboardingCompleted?: boolean
    } | null
  }
}

export interface MeResponse {
  authenticated: boolean
  user: AuthResponse["user"]
}

export function transformToUserProfile(userData: AuthResponse["user"]): UserProfile {
  return {
    ...defaultMockUser,
    id: userData.id,
    name: userData.name,
    email: userData.email,
    avatarUrl: userData.profile?.avatarUrl || undefined,
    targetRole: userData.profile?.targetRole || defaultMockUser.targetRole,
    level: (userData.profile?.level as any) || defaultMockUser.level,
    joinedAt: userData.createdAt || new Date().toISOString(),
  }
}

export const authService = {
  /**
   * Real registration endpoint
   */
  async register(name: string, email: string, password: string, confirmPassword?: string): Promise<UserProfile> {
    const res = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      confirmPassword: confirmPassword || password,
    })
    if (res.data?.token) {
      try {
        localStorage.setItem("pathlearn_token", res.data.token)
      } catch {
        // ignore
      }
    }
    return transformToUserProfile(res.data.user)
  },

  /**
   * Real login endpoint
   */
  async login(email: string, password: string): Promise<UserProfile> {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    })
    if (res.data?.token) {
      try {
        localStorage.setItem("pathlearn_token", res.data.token)
      } catch {
        // ignore
      }
    }
    return transformToUserProfile(res.data.user)
  },

  /**
   * Real logout endpoint clearing HTTP-only cookie and local token
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem("pathlearn_token")
    } catch {
      // ignore
    }
    try {
      await api.post("/auth/logout")
    } catch {
      // ignore
    }
  },

  /**
   * Real /me endpoint restoring session from HTTP-only cookie
   */
  async getCurrentUser(): Promise<UserProfile> {
    const res = await api.get<MeResponse>("/auth/me")
    return transformToUserProfile(res.data.user)
  },

  /**
   * Update profile endpoint persisting name and targetRole to database
   */
  async updateUserProfile(updates: { name?: string; targetRole?: string; avatarUrl?: string }): Promise<UserProfile> {
    const res = await api.put<{ message: string; user: AuthResponse["user"] }>("/profile", updates)
    return transformToUserProfile(res.data.user)
  },
}

export default authService
