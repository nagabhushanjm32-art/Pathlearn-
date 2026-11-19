import { Router } from "express"
import {
  checkEligibilityHandler,
  generateCertificateHandler,
  getUserCertificates,
  getCertificateById,
  downloadCertificatePDF,
  verifyCertificatePublic,
  revokeCertificate,
} from "../controllers/certificateController"
import { authenticate } from "../middleware/authMiddleware"

const router = Router()

// 1. Check current user's eligibility for domain
router.post("/check-eligibility", authenticate, checkEligibilityHandler)

// 2. Generate and issue certificate
router.post("/generate/:domainId", authenticate, generateCertificateHandler)

// 3. Get user's certificates dashboard
router.get("/", authenticate, getUserCertificates)

// 4. Public verification (NO LOGIN REQUIRED)
router.get("/verify/:certificateCode", verifyCertificatePublic)

// 5. Download Certificate PDF
router.get("/:id/download", downloadCertificatePDF)

// 6. Get single certificate details
router.get("/:id", authenticate, getCertificateById)

// 7. Revoke certificate
router.post("/:id/revoke", authenticate, revokeCertificate)

export default router
