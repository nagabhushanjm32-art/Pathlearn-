import { Router } from "express"
import { sendChatMessage } from "../controllers/chatController"
import { optionalAuth } from "../middleware/authMiddleware"

const router = Router()

router.post("/message", optionalAuth, sendChatMessage)
router.post("/", optionalAuth, sendChatMessage)

export default router
