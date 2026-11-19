/**
 * Dynamic Time-Aware Greeting and Name Formatting Utilities
 */

export interface TimeGreetingData {
  greeting: string
  period: "morning" | "afternoon" | "evening" | "night"
  emoji: string
  subBadge: string
  quote: string
  colorTheme: {
    badgeBg: string
    badgeText: string
    glowColor: string
    gradient: string
  }
}

/**
 * Returns dynamic greeting details based on the current local hour:
 * - 05:00 - 11:59 -> Good morning
 * - 12:00 - 16:59 -> Good afternoon
 * - 17:00 - 21:59 -> Good evening
 * - 22:00 - 04:59 -> Good evening / Late Night Focus
 */
export function getTimeGreeting(customDate?: Date): TimeGreetingData {
  const now = customDate || new Date()
  const hour = now.getHours()

  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good morning",
      period: "morning",
      emoji: "🌅",
      subBadge: "Morning Focus Window",
      quote: "Start your day with high-impact learning. Every concept mastered compounds your growth!",
      colorTheme: {
        badgeBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30",
        badgeText: "text-amber-600 dark:text-amber-400",
        glowColor: "rgba(245, 158, 11, 0.15)",
        gradient: "from-amber-500/10 via-background to-indigo-500/5",
      },
    }
  }

  if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good afternoon",
      period: "afternoon",
      emoji: "☀️",
      subBadge: "Afternoon Deep Work",
      quote: "Keep your momentum going! Great time to tackle hands-on practice, quizzes, or video steps.",
      colorTheme: {
        badgeBg: "bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/30",
        badgeText: "text-orange-600 dark:text-orange-400",
        glowColor: "rgba(249, 115, 22, 0.15)",
        gradient: "from-orange-500/10 via-background to-indigo-500/5",
      },
    }
  }

  if (hour >= 17 && hour < 22) {
    return {
      greeting: "Good evening",
      period: "evening",
      emoji: "🌆",
      subBadge: "Evening Skill Review",
      quote: "Wind down your day with focused revision or an AI mock interview practice session.",
      colorTheme: {
        badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/30",
        badgeText: "text-indigo-600 dark:text-indigo-400",
        glowColor: "rgba(99, 102, 241, 0.15)",
        gradient: "from-indigo-500/10 via-background to-purple-500/5",
      },
    }
  }

  // 22:00 (10 PM) to 04:59 (5 AM)
  return {
    greeting: "Good evening",
    period: "night",
    emoji: "🌙",
    subBadge: "Late Night Coding Session",
    quote: "Night-owl focus mode active! Quiet hours are prime time for deep learning and mastery.",
    colorTheme: {
      badgeBg: "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/30",
      badgeText: "text-purple-600 dark:text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.15)",
      gradient: "from-purple-500/10 via-background to-blue-500/5",
    },
  }
}

/**
 * Cleanly capitalizes and extracts a human-friendly first name or display name.
 * Handles single-letter initials like "k r punith" -> "Punith"
 */
export function formatDisplayName(rawName?: string | null): string {
  if (!rawName || !rawName.trim()) {
    return "Learner"
  }

  const clean = rawName.trim()
  const parts = clean.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "Learner"

  // Check if first part is a single character (like 'k' in 'k r punith')
  if (parts[0].length <= 2 && parts.length > 1) {
    // Find the first longer name token (e.g. 'punith')
    const substantivePart = parts.find((p) => p.length > 2)
    if (substantivePart) {
      return substantivePart.charAt(0).toUpperCase() + substantivePart.slice(1).toLowerCase()
    }
  }

  // Otherwise capitalize the first word
  const first = parts[0]
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

/**
 * Format full name properly in Title Case (e.g., "k r punith" -> "K R Punith")
 */
export function formatFullName(rawName?: string | null): string {
  if (!rawName || !rawName.trim()) return "Learner"
  return rawName
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
