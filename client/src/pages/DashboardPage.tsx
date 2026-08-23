import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="secondary" onClick={handleLogout}>Log out</Button>
      </div>
      <p className="text-gray-400 mb-6">Welcome! You are logged in.</p>
      <Button onClick={() => navigate("/domains")}>Explore Domains</Button>
    </div>
  )
}
