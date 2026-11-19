import { Request, Response } from "express"
import prisma from "../utils/prisma"
import { AuthRequest } from "../middleware/authMiddleware"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import {
  checkCertificateEligibility,
  generateCertificateId,
  generateCertificatePDF,
  saveCertificatePDF,
} from "../services/certificateService"
import { env } from "../config/env"

/**
 * 1. POST /api/certificates/check-eligibility
 * Check if the authenticated user meets all 3 certificate requirements for a domain
 */
export async function checkEligibilityHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const domainSlug = (req.body.domainSlug || req.body.domainId || req.query.domainSlug || "") as string

  if (!domainSlug) {
    return res.status(400).json({ message: "domainSlug or domainId is required" })
  }

  try {
    const result = await checkCertificateEligibility(userId, domainSlug)
    return res.status(200).json(result)
  } catch (error) {
    console.error("CHECK CERTIFICATE ELIGIBILITY ERROR:", error)
    return res.status(500).json({ message: "Failed to verify certificate eligibility" })
  }
}

/**
 * 2. POST /api/certificates/generate/:domainId
 * Server-side verified certificate generation
 */
export async function generateCertificateHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const domainSlugOrId = (req.params.domainId || req.body.domainSlug || "") as string

  try {
    // 1. Resolve user and domain
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: "User account not found" })
    }

    const domain = await prisma.domain.findFirst({
      where: {
        OR: [{ slug: domainSlugOrId }, { id: domainSlugOrId }],
      },
    })

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    // 2. Prevent duplicates: return existing active certificate if already generated
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId,
        domainId: domain.id,
        status: "ACTIVE",
      },
      include: {
        domain: true,
        user: true,
      },
    })

    if (existingCertificate) {
      const formattedDate = new Date(existingCertificate.issuedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      return res.status(200).json({
        message: "You already earned this certificate.",
        certificate: {
          id: existingCertificate.id,
          certificateId: existingCertificate.certificateId,
          certificateCode: existingCertificate.certificateCode || existingCertificate.certificateId,
          domainId: existingCertificate.domain.id,
          domainName: existingCertificate.domain.name,
          domainSlug: existingCertificate.domain.slug,
          recipientName: existingCertificate.user.name,
          score: existingCertificate.score,
          roadmapScore: existingCertificate.roadmapScore || 100,
          quizScore: existingCertificate.quizScore || 85,
          interviewScore: existingCertificate.interviewScore || existingCertificate.score,
          issuedAt: existingCertificate.issuedAt,
          issueDate: formattedDate,
          pdfUrl: existingCertificate.pdfUrl || `/api/certificates/${existingCertificate.id}/download`,
          verificationUrl: existingCertificate.verificationUrl || `/verify/${existingCertificate.certificateId}`,
          skillsDemonstrated: domain.skillTags || [],
          status: existingCertificate.status,
        },
      })
    }

    // 3. Re-verify eligibility strictly from database
    const eligibility = await checkCertificateEligibility(userId, domain.id)

    if (!eligibility.eligible) {
      return res.status(400).json({
        message: "Certificate requirements not satisfied.",
        eligibility,
      })
    }

    // 4. Generate unique cryptographically formatted certificate ID
    const certificateCode = generateCertificateId(domain.slug)
    const clientBaseUrl = env.clientUrl || "http://localhost:5173"
    const verificationUrl = `${clientBaseUrl}/verify/${certificateCode}`

    const issueDateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    const overallScore = Math.round(
      eligibility.interviewScore * 0.7 + (eligibility.quizScore || 85) * 0.3
    )

    // 5. Generate and save PDF
    const pdfBuffer = await generateCertificatePDF({
      certificateId: certificateCode,
      certificateCode,
      recipientName: user.name,
      domainName: domain.name,
      domainSlug: domain.slug,
      score: overallScore,
      roadmapScore: 100,
      quizScore: eligibility.quizScore || 85,
      interviewScore: eligibility.interviewScore,
      issueDate: issueDateStr,
      verificationUrl,
      skillsDemonstrated: domain.skillTags || [],
    })

    const pdfDownloadUrl = await saveCertificatePDF(certificateCode, pdfBuffer)

    // 6. Save Certificate to PostgreSQL database
    const createdCert = await prisma.certificate.create({
      data: {
        certificateId: certificateCode,
        certificateCode,
        userId,
        domainId: domain.id,
        score: overallScore,
        roadmapScore: 100,
        quizScore: eligibility.quizScore || 85,
        interviewScore: eligibility.interviewScore,
        pdfUrl: pdfDownloadUrl,
        verificationUrl,
        status: "ACTIVE",
        issuedAt: new Date(),
      },
      include: {
        domain: true,
        user: true,
      },
    })

    return res.status(201).json({
      message: "Certificate generated successfully",
      certificate: {
        id: createdCert.id,
        certificateId: createdCert.certificateId,
        certificateCode: createdCert.certificateCode,
        domainId: createdCert.domain.id,
        domainName: createdCert.domain.name,
        domainSlug: createdCert.domain.slug,
        recipientName: createdCert.user.name,
        score: createdCert.score,
        roadmapScore: createdCert.roadmapScore,
        quizScore: createdCert.quizScore,
        interviewScore: createdCert.interviewScore,
        issuedAt: createdCert.issuedAt,
        issueDate: issueDateStr,
        pdfUrl: `/api/certificates/${createdCert.id}/download`,
        verificationUrl,
        skillsDemonstrated: domain.skillTags || [],
        status: createdCert.status,
      },
    })
  } catch (error) {
    console.error("GENERATE CERTIFICATE ERROR:", error)
    return res.status(500).json({ message: "Failed to generate certificate" })
  }
}

/**
 * 3. GET /api/certificates
 * Get all certificates earned by the authenticated user
 */
export async function getUserCertificates(req: AuthRequest, res: Response) {
  const userId = req.user!.userId

  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        domain: true,
        user: true,
      },
      orderBy: { issuedAt: "desc" },
    })

    const formatted = certificates.map((cert) => {
      const issueDateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      return {
        id: cert.id,
        certificateId: cert.certificateId,
        certificateCode: cert.certificateCode || cert.certificateId,
        domainId: cert.domain.id,
        domainName: cert.domain.name,
        domainSlug: cert.domain.slug,
        recipientName: cert.user.name,
        score: cert.score,
        roadmapScore: cert.roadmapScore || 100,
        quizScore: cert.quizScore || 85,
        interviewScore: cert.interviewScore || cert.score,
        issuedAt: cert.issuedAt,
        issueDate: issueDateStr,
        pdfUrl: `/api/certificates/${cert.id}/download`,
        verificationUrl: cert.verificationUrl || `/verify/${cert.certificateId}`,
        skillsDemonstrated: cert.domain.skillTags || [],
        status: cert.status,
      }
    })

    return res.status(200).json({
      certificates: formatted,
    })
  } catch (error) {
    console.error("GET USER CERTIFICATES ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch user certificates" })
  }
}

/**
 * 4. GET /api/certificates/:id
 * Get single certificate details by id or certificate code
 */
export async function getCertificateById(req: AuthRequest, res: Response) {
  const targetId = (req.params.id || "") as string
  const userId = req.user!.userId

  try {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: targetId }, { certificateId: targetId }, { certificateCode: targetId }],
      },
      include: {
        domain: true,
        user: true,
      },
    })

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" })
    }

    // Ownership check
    if (cert.userId !== userId) {
      return res.status(403).json({ message: "You do not have permission to view this certificate." })
    }

    const issueDateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    return res.status(200).json({
      certificate: {
        id: cert.id,
        certificateId: cert.certificateId,
        certificateCode: cert.certificateCode || cert.certificateId,
        domainId: cert.domain.id,
        domainName: cert.domain.name,
        domainSlug: cert.domain.slug,
        recipientName: cert.user.name,
        score: cert.score,
        roadmapScore: cert.roadmapScore || 100,
        quizScore: cert.quizScore || 85,
        interviewScore: cert.interviewScore || cert.score,
        issuedAt: cert.issuedAt,
        issueDate: issueDateStr,
        pdfUrl: `/api/certificates/${cert.id}/download`,
        verificationUrl: cert.verificationUrl || `/verify/${cert.certificateId}`,
        skillsDemonstrated: cert.domain.skillTags || [],
        status: cert.status,
      },
    })
  } catch (error) {
    console.error("GET CERTIFICATE BY ID ERROR:", error)
    return res.status(500).json({ message: "Failed to fetch certificate" })
  }
}

/**
 * 5. GET /api/certificates/:id/download
 * Download the high-fidelity PDF certificate
 */
export async function downloadCertificatePDF(req: Request, res: Response) {
  const targetId = (req.params.id || "") as string

  try {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: targetId }, { certificateId: targetId }, { certificateCode: targetId }],
      },
      include: {
        domain: true,
        user: true,
      },
    })

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" })
    }

    const code = cert.certificateCode || cert.certificateId
    const uploadsDir = path.join(__dirname, "../../../uploads/certificates")
    const filePath = path.join(uploadsDir, `${code}.pdf`)

    // If PDF file exists on disk, stream it
    if (fs.existsSync(filePath)) {
      const pdfBuffer = await fs.promises.readFile(filePath)
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename="PathLearn-Certificate-${code}.pdf"`)
      return res.send(pdfBuffer)
    }

    // If file missing on disk, generate dynamically on-the-fly
    const issueDateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    const pdfBuffer = await generateCertificatePDF({
      certificateId: cert.certificateId,
      certificateCode: code,
      recipientName: cert.user.name,
      domainName: cert.domain.name,
      domainSlug: cert.domain.slug,
      score: cert.score,
      roadmapScore: cert.roadmapScore || 100,
      quizScore: cert.quizScore || 85,
      interviewScore: cert.interviewScore || cert.score,
      issueDate: issueDateStr,
      verificationUrl: cert.verificationUrl || `${env.clientUrl || "http://localhost:5173"}/verify/${code}`,
      skillsDemonstrated: cert.domain.skillTags || [],
    })

    await saveCertificatePDF(code, pdfBuffer)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="PathLearn-Certificate-${code}.pdf"`)
    return res.send(pdfBuffer)
  } catch (error) {
    console.error("DOWNLOAD CERTIFICATE PDF ERROR:", error)
    return res.status(500).json({ message: "Failed to download certificate PDF" })
  }
}

/**
 * 6. GET /api/certificates/verify/:certificateCode
 * Public verification endpoint (NO LOGIN REQUIRED)
 */
export async function verifyCertificatePublic(req: Request, res: Response) {
  const codeParam = (req.params.certificateCode || "") as string
  const cleanCode = codeParam.trim()

  if (!cleanCode) {
    return res.status(400).json({ message: "Certificate code is required" })
  }

  try {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateCode: { equals: cleanCode, mode: "insensitive" } },
          { certificateId: { equals: cleanCode, mode: "insensitive" } },
        ],
      },
      include: {
        domain: true,
        user: true,
      },
    })

    if (!cert) {
      return res.status(404).json({
        authentic: false,
        status: "NOT_FOUND",
        message: "The certificate ID you entered could not be verified.",
      })
    }

    // Anonymize IP hash for privacy
    const rawIp = (req.ip || req.socket.remoteAddress || "anonymous") as string
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").substring(0, 16)
    const rawUa = (req.headers["user-agent"] || "unknown") as string

    // Log verification event safely
    await prisma.certificateVerification.create({
      data: {
        certificateId: cert.certificateId,
        ipHash,
        userAgent: rawUa.substring(0, 150),
        verifiedAt: new Date(),
      },
    })

    const isRevoked = cert.status === "REVOKED" || cert.revoked

    const issueDateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    return res.status(200).json({
      authentic: !isRevoked,
      status: isRevoked ? "REVOKED" : "ACTIVE",
      certificate: {
        id: cert.id,
        certificateId: cert.certificateId,
        certificateCode: cert.certificateCode || cert.certificateId,
        domainId: cert.domain.id,
        domainName: cert.domain.name,
        domainSlug: cert.domain.slug,
        recipientName: cert.user.name,
        score: cert.score,
        roadmapScore: cert.roadmapScore || 100,
        quizScore: cert.quizScore || 85,
        interviewScore: cert.interviewScore || cert.score,
        issuedAt: cert.issuedAt,
        issueDate: issueDateStr,
        skillsDemonstrated: cert.domain.skillTags || [],
        pdfUrl: `/api/certificates/${cert.id}/download`,
        verificationUrl: `/verify/${cert.certificateId}`,
      },
    })
  } catch (error) {
    console.error("PUBLIC CERTIFICATE VERIFICATION ERROR:", error)
    return res.status(500).json({ message: "Verification processing failed" })
  }
}

/**
 * 7. POST /api/certificates/:id/revoke
 * Revoke an active certificate
 */
export async function revokeCertificate(req: AuthRequest, res: Response) {
  const targetId = (req.params.id || "") as string

  try {
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: targetId }, { certificateId: targetId }, { certificateCode: targetId }],
      },
    })

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" })
    }

    const updated = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "REVOKED",
        revoked: true,
        revokedAt: new Date(),
      },
    })

    return res.status(200).json({
      message: "Certificate has been revoked successfully.",
      certificate: updated,
    })
  } catch (error) {
    console.error("REVOKE CERTIFICATE ERROR:", error)
    return res.status(500).json({ message: "Failed to revoke certificate" })
  }
}
