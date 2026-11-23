export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export interface Domain {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  difficulty: DifficultyLevel
  estimatedDays: number
  progress: number
  totalSteps: number
  completedSteps: number
  skillTags: string[]
  targetRoles: string[]
  colorScheme?: string
}

export interface StepResource {
  id: string
  title: string
  type: "VIDEO" | "ARTICLE" | "DOCS" | "GITHUB" | string
  url: string
  duration?: string
  channel?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty?: DifficultyLevel
}

export interface StepQuiz {
  id: string
  roadmapStepId?: string
  stepTitle?: string
  stepOrder?: number
  title?: string
  totalQuestions: number
  passingScore: number
  questions: QuizQuestion[]
  isPassed?: boolean
  bestScore?: number | null
  score?: number
}

export interface QuizAttemptResult {
  id: string
  score: number
  totalCount: number
  percentage: number
  isPassed: boolean
  passingScore: number
  answers: {
    questionId: string
    selectedIndex: number
    correctIndex: number
    isCorrect: boolean
    explanation: string
  }[]
}

export interface StepNote {
  id?: string
  topic?: string
  whatIsIt?: string
  keyConcepts?: string[]
  howItWorks?: string[]
  importantTerms?: { term: string; explanation: string }[]
  example?: { code: string; language: string; explanation: string }
  keyTakeaways?: string[]
  interviewTip?: string
  title?: string
  summary?: string
  codeSnippet?: string
}

export interface RoadmapStep {
  id: string
  order: number
  title: string
  description: string
  difficulty: DifficultyLevel
  estimatedMinutes: number
  skillsGained: string[]
  prerequisites?: string[]
  learningObjectives?: string[]
  interviewRelevance?: string
  isCompleted: boolean
  isCurrent?: boolean
  isLocked: boolean
  videoProgress?: number
  videoStarted?: boolean
  videoCompleted?: boolean
  quizCompleted?: boolean
  thumbnailUrl?: string
  videoUrl?: string
  videoDuration?: string
  videoChannel?: string
  notes?: StepNote
  quiz?: StepQuiz
}

export interface StepDetail {
  id: string
  roadmapId: string
  domainId: string
  domainName: string
  domainSlug: string
  order: number
  title: string
  description: string
  difficulty: DifficultyLevel
  estimatedMinutes: number
  prerequisites: string[]
  learningObjectives: string[]
  skillsGained: string[]
  interviewRelevance?: string
  isLocked: boolean
  isCompleted: boolean
  videoProgress: number
  videoStarted: boolean
  videoCompleted: boolean
  quizCompleted: boolean
  video: {
    id: string
    youtubeId: string
    title: string
    channel: string
    thumbnailUrl: string
    durationSecs: number
    url: string
  }
  resources?: StepResource[]
  nextStepId?: string | null
  prevStepId?: string | null
  totalStepsInRoadmap: number
}

export interface Roadmap {
  id: string
  domainId: string
  domainName: string
  domainSlug: string
  domainDescription: string
  icon: string
  targetRoles: string[]
  progress: number
  totalSteps: number
  completedSteps: number
  skillsCount: number
  skills: string[]
  steps: RoadmapStep[]
}

export interface ActivityItem {
  id: string
  type: "LESSON_COMPLETED" | "QUIZ_PASSED" | "INTERVIEW_COMPLETED" | "CERTIFICATE_EARNED"
  title: string
  subtitle?: string
  timestamp: string
  timeAgo: string
  icon: string
  status: "success" | "info" | "warning" | "gold"
}

export interface ActiveStep {
  stepId: string
  stepOrder: number
  stepTitle: string
  stepDescription: string
  domainName: string
  domainSlug: string
  videoProgress: number
  videoCompleted: boolean
  quizCompleted: boolean
  thumbnailUrl: string
}

export interface DashboardStats {
  lessonsCompleted: number
  quizzesPassed: number
  overallProgress: number
  certificatesEarned: number
  totalSteps: number
  completedSteps: number
  streakDays: number
  activeStep?: ActiveStep | null
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  targetRole: string
  level: DifficultyLevel
  lessonsCompleted: number
  quizzesPassed: number
  overallProgress: number
  certificatesEarned: number
  joinedAt?: string
  createdAt?: string
}

export interface CertificateEligibility {
  eligible: boolean
  domainSlug?: string
  domainName?: string
  roadmapProgress: number
  quizzesPassed: boolean
  quizScore: number
  interviewPassed: boolean
  interviewScore: number
  totalSteps?: number
  completedSteps?: number
  totalQuizzes?: number
  passedQuizzes?: number
  requirements: {
    roadmap: boolean
    quizzes: boolean
    interview: boolean
  }
  // Backwards-compatible aliases
  roadmapCompleted?: boolean
  quizzesScoreRatio?: string
  mockInterviewPassed?: boolean
  mockInterviewScore?: number
  isEligible?: boolean
  requirementsMetCount?: number
  totalRequirementsCount?: number
}

export interface Certificate {
  id: string
  certificateId: string
  certificateCode?: string
  domainId: string
  domainName: string
  roleName?: string
  domainSlug: string
  recipientName: string
  score: number
  roadmapScore?: number
  quizScore?: number
  interviewScore?: number
  issuedAt?: string
  issueDate: string
  skillsDemonstrated: string[]
  pdfUrl?: string
  verificationUrl: string
  qrCodeUrl?: string
  status: "ACTIVE" | "VALID" | "REVOKED"
}

export type InterviewState =
  | "PREPARING"
  | "CAMERA_READY"
  | "MIC_READY"
  | "READY"
  | "ASKING"
  | "LISTENING"
  | "ANSWER_REVIEW"
  | "ANALYZING"
  | "NEXT_QUESTION"
  | "COMPLETING"
  | "RESULT"
  | "ERROR"

export type InterviewQuestionType =
  | "conceptual"
  | "practical"
  | "scenario"
  | "debugging"
  | "system_design"
  | "project_based"
  | "problem_solving"

export type InterviewDifficulty = "easy" | "medium" | "hard" | "expert"

export interface InterviewQuestionItem {
  id: string
  mockInterviewId?: string
  order: number
  question: string
  topic?: string | null
  difficulty?: string | null
  questionType?: string | null
  answer?: string | null
  score?: number | null
  correctness?: number | null
  technicalDepth?: number | null
  clarity?: number | null
  knowledgeLevel?: string | null
  strengths: string[]
  weaknesses: string[]
  missingConcepts: string[]
  feedback?: string | null
  createdAt?: string
}

export interface MockInterviewSession {
  id: string
  userId: string
  domainId: string
  domain: {
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    skillTags?: string[]
  }
  type: string
  difficulty: string
  status: string
  totalQuestions: number
  currentQuestion: number
  overallScore?: number | null
  technicalScore?: number | null
  problemSolvingScore?: number | null
  communicationScore?: number | null
  practicalScore?: number | null
  conceptualScore?: number | null
  readinessLevel?: string | null
  strongAreas: string[]
  weakAreas: string[]
  recommendation?: string | null
  recommendedTopics: string[]
  startedAt: string
  completedAt?: string | null
  questions: InterviewQuestionItem[]
}

export interface AnswerEvaluationData {
  score: number
  correctness: number
  technicalDepth: number
  clarity: number
  knowledgeLevel: "beginner" | "intermediate" | "advanced" | "expert"
  strengths: string[]
  weaknesses: string[]
  missingConcepts: string[]
  feedback: string
}

export interface FinalEvaluationData {
  overallScore: number
  technicalScore: number
  problemSolvingScore: number
  communicationScore: number
  practicalScore: number
  conceptualScore: number
  readinessLevel: string
  strengths: string[]
  weaknesses: string[]
  recommendedTopics: string[]
  recommendation: string
}

export interface InterviewQuestionBreakdown {
  id: string
  questionNumber: number
  topic: string
  score: number
  difficulty?: string
  feedback?: string
}

export interface MockInterviewResult {
  id: string
  interviewId: string
  domainId: string
  domainName: string
  domainSlug?: string
  overallScore: number
  technicalScore?: number
  problemSolvingScore?: number
  communicationScore?: number
  practicalScore?: number
  conceptualScore?: number
  readinessLevel?: string
  status: "PASSED" | "NEEDS_IMPROVEMENT"
  completedAt: string
  strengths: string[]
  areasToImprove: string[]
  recommendedTopics?: string[]
  questionBreakdown: InterviewQuestionBreakdown[]
  aiRecommendation: string
  isPassed?: boolean
  interview?: MockInterviewSession
}

export interface InterviewHistoryItem {
  id: string
  domainId: string
  domain: {
    id: string
    name: string
    slug: string
    icon?: string
  }
  difficulty: string
  overallScore: number | null
  readinessLevel: string | null
  totalQuestions: number
  completedAt: string | null
  createdAt: string
  status: string
  isPassed: boolean
}

// ==========================================
// PHASE 6: AI CAREER PROFILE & RESUME TYPES
// ==========================================

export interface ReadinessBreakdown {
  technicalSkills: number
  learningProgress: number
  quizPerformance: number
  aiInterview: number
  projects: number
  weights: {
    technicalSkills: string
    learningProgress: string
    quizPerformance: string
    aiInterview: string
    projects: string
  }
  formulaExplanation: string
}

export interface CareerProfileData {
  id: string
  targetRole: string
  readinessScore: number
  profileCompletion: number
  breakdown: ReadinessBreakdown
}

export interface ResumeStatus {
  hasResume: boolean
  id?: string
  fileName?: string
  fileSize?: number
  resumeScore?: number
  uploadedAt?: string
  aiAnalysis?: any
}

export interface UserSkillItem {
  id: string
  name: string
  category: string
  level: string
  confidence: number
  source: string
  createdAt?: string
}

export interface SkillGapItem {
  id?: string
  skillName: string
  currentLevel: string
  requiredLevel: string
  matchPercentage: number
  gapScore: number
  status: "STRONG" | "GOOD" | "NEEDS_IMPROVEMENT" | "MISSING"
  whyItMatters: string
  recommendedTopics: string[]
  estimatedEffort: string
}

export interface ProjectRecommendation {
  title: string
  difficulty: string
  skills: string[]
  estimatedTime: string
  whyItHelps: string
  description: string
}

export interface ResumeImprovementData {
  resumeScore: number
  sectionChecklist: {
    contact: boolean
    education: boolean
    technicalSkills: boolean
    projects: "GOOD" | "WARN" | "MISSING"
    experience: "GOOD" | "WARN" | "MISSING"
    quantifiableAchievements: boolean
  }
  atsKeywords: {
    matched: string[]
    missing: string[]
  }
  projectAnalyses: Array<{
    projectName: string
    currentDepth: string
    relevantSkills: string[]
    suggestions: string[]
  }>
  careerInsights: string
}

