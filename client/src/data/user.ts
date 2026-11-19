import { UserProfile } from "../types"

export type { UserProfile }

export const currentUser: UserProfile = {
  id: "usr_default",
  name: "Student",
  email: "student@pathlearn.io",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  targetRole: "AI / ML Engineer",
  level: "BEGINNER",
  lessonsCompleted: 0,
  quizzesPassed: 0,
  overallProgress: 0,
  certificatesEarned: 0,
  joinedAt: "2026-01-15",
}
