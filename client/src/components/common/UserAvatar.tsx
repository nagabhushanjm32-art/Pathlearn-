import React from "react"

interface UserAvatarProps {
  name: string
  avatarUrl?: string
  size?: "sm" | "md" | "lg" | "xl"
  showOnlineStatus?: boolean
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = "md",
  showOnlineStatus = false,
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  }

  const getInitials = (str: string) => {
    if (!str) return "PL"
    const parts = str.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return str.substring(0, 2).toUpperCase()
  }

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-border shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center border-2 border-border shadow-sm`}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
      )}
    </div>
  )
}

export default UserAvatar
