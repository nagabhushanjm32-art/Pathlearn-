import app from "./app"
import { config } from "./config"

const PORT = config.port || 5000

app.listen(PORT, () => {
  console.log(`===========================================`)
  console.log(`🚀 PathLearn API Server running on port ${PORT}`)
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`)
  console.log(`===========================================`)
})
