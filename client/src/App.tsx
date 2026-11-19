import { Routes, Route, Navigate } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import DomainExplorerPage from "./pages/DomainExplorerPage"
import RoadmapPage from "./pages/RoadmapPage"
import LearnPage from "./pages/LearnPage"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./pages/SettingsPage"
import InterviewSetupPage from "./pages/InterviewSetupPage"
import InterviewRoomPage from "./pages/InterviewRoomPage"
import InterviewResultsPage from "./pages/InterviewResultsPage"
import InterviewHistoryPage from "./pages/InterviewHistoryPage"
import CertificateDashboardPage from "./pages/CertificateDashboardPage"
import CertificateViewPage from "./pages/CertificateViewPage"
import PublicVerificationPage from "./pages/PublicVerificationPage"
import CareerProfilePage from "./pages/CareerProfilePage"
import SkillGapPage from "./pages/SkillGapPage"
import QuizPage from "./pages/QuizPage"
import NotesPage from "./pages/NotesPage"
import AiChatPage from "./pages/AiChatPage"
import DsaArenaPage from "./pages/DsaArenaPage"
import ResearchPaperPage from "./pages/ResearchPaperPage"
import ResumeBuilderPage from "./pages/ResumeBuilderPage"
import JobOpeningsPage from "./pages/JobOpeningsPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import PublicRoute from "./components/auth/PublicRoute"

function App() {
  return (
    <Routes>
      {/* Public Auth Routes (Redirect to /dashboard if already logged in) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Public Certificate Verification (Accessible to anyone without login) */}
      <Route path="/verify" element={<PublicVerificationPage />} />
      <Route path="/verify/:certificateId" element={<PublicVerificationPage />} />

      {/* Protected Routes (Require Authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/domains" element={<DomainExplorerPage />} />
          <Route path="/domains/:domainId" element={<RoadmapPage />} />
          <Route path="/learn/:stepId" element={<LearnPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* AI Chatbot & Resume Copilot */}
          <Route path="/ai-chat" element={<AiChatPage />} />
          <Route path="/chat" element={<AiChatPage />} />

          {/* LeetCode Style DSA Coding Arena */}
          <Route path="/dsa" element={<DsaArenaPage />} />
          <Route path="/dsa/:problemId" element={<DsaArenaPage />} />
          <Route path="/coding-arena" element={<DsaArenaPage />} />

          {/* AI Research Paper Generator & Academic Studio */}
          <Route path="/research-paper" element={<ResearchPaperPage />} />
          <Route path="/paper-generator" element={<ResearchPaperPage />} />

          {/* Professional ATS Resume Builder & Career Optimizer */}
          <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/resume" element={<ResumeBuilderPage />} />
          <Route path="/resumes" element={<ResumeBuilderPage />} />

          {/* Tech Internships & Student Programs */}
          <Route path="/jobs" element={<JobOpeningsPage />} />
          <Route path="/jobs/:jobId" element={<JobOpeningsPage />} />
          <Route path="/internships" element={<JobOpeningsPage />} />
          <Route path="/internships/:jobId" element={<JobOpeningsPage />} />
          <Route path="/job-openings" element={<JobOpeningsPage />} />
          <Route path="/careers" element={<JobOpeningsPage />} />

          {/* Learning Interactivity */}
          <Route path="/quiz/:stepId" element={<QuizPage />} />
          <Route path="/notes/:stepId" element={<NotesPage />} />

          {/* AI Mock Interviews */}
          <Route path="/mock-interview/history" element={<InterviewHistoryPage />} />
          <Route path="/interview/history" element={<InterviewHistoryPage />} />
          <Route path="/interview-setup/:domainId" element={<InterviewSetupPage />} />
          <Route path="/mock-interview/:domainId" element={<InterviewSetupPage />} />
          <Route path="/interview/:interviewId" element={<InterviewRoomPage />} />
          <Route path="/interview/:interviewId/results" element={<InterviewResultsPage />} />
          <Route path="/mock-interview/:interviewId/results" element={<InterviewResultsPage />} />

          {/* Certificates */}
          <Route path="/certificates" element={<CertificateDashboardPage />} />
          <Route path="/certificates/:id" element={<CertificateViewPage />} />
          <Route path="/certificate/:domainId" element={<CertificateViewPage />} />

          {/* AI Career Profile & Resume Analyzer */}
          <Route path="/career-profile" element={<CareerProfilePage />} />
          <Route path="/career-profile/skill-gap" element={<SkillGapPage />} />
        </Route>
      </Route>

      {/* Fallback to Dashboard (Redirects to Login if unauthenticated) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
