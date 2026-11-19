import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

export default function QuizPage() {
  const { stepId } = useParams<{ stepId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (stepId) {
      navigate(`/learn/${stepId}`, { replace: true })
    } else {
      navigate("/domains", { replace: true })
    }
  }, [stepId, navigate])

  return (
    <div className="p-16 text-center text-xs text-muted-foreground animate-pulse">
      Loading quiz module...
    </div>
  )
}
