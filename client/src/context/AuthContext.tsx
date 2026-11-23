import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { UserProfile } from "../types"
import { authService } from "../services/authService"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, pass: string, confirmPass?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Verify and restore authenticated session on app boot
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, pass: string) => {
    try {
      const loggedUser = await authService.login(email, pass)
      setUser(loggedUser)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.form?.[0] ||
        "Invalid email or password."
      return { success: false, error: message }
    }
  }

  const register = async (name: string, email: string, pass: string, confirmPass?: string) => {
    try {
      const newUser = await authService.register(name, email, pass, confirmPass || pass)
      setUser(newUser)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.password?.[0] ||
        error.response?.data?.errors?.confirmPassword?.[0] ||
        "Failed to create account. Please try again."
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.warn("Logout error from server, clearing local state:", err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // 1. Optimistically update local state
    setUser((prev: UserProfile | null) => (prev ? { ...prev, ...updates } : null))

    // 2. Persist to server database
    try {
      const persistedUser = await authService.updateUserProfile({
        name: updates.name,
        targetRole: updates.targetRole,
        avatarUrl: updates.avatarUrl,
      })
      setUser(persistedUser)
      return persistedUser
    } catch (err) {
      console.warn("Failed to persist profile update to database:", err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
