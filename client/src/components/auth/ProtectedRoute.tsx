import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Logo } from "../common/Logo"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground select-none">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
          <Logo size="lg" linkTo="" />
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Verifying secure session...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
