import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import OnboardingPage from "./pages/OnboardingPage"
import DomainExplorerPage from "./pages/DomainExplorerPage"
import RoadmapPage from "./pages/RoadmapPage"
import QuizPage from "./pages/QuizPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/domains" element={<DomainExplorerPage />} />
      <Route path="/domains/:domainId" element={<RoadmapPage />} />
      <Route path="/quiz/:stepId" element={<QuizPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
