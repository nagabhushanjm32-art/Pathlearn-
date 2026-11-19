import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Award,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Check,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mic,
  Copy,
  BookOpen,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CertificatePreview } from "../components/certificates/CertificatePreview"
import { certificateService } from "../services/certificateService"
import { domainService } from "../services/domainService"
import { useAuth } from "../context/AuthContext"
import { Certificate, CertificateEligibility, Domain } from "../types"

export default function CertificateViewPage() {
  const { id, domainId } = useParams<{ id?: string; domainId?: string }>()
  const targetParam = id || domainId || "ai-engineer"
  const navigate = useNavigate()
  const { user } = useAuth()

  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null)
  const [domain, setDomain] = useState<Domain | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generationStep, setGenerationStep] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  // Load Certificate or Eligibility
  useEffect(() => {
    async function loadCertificateData() {
      try {
        setLoading(true)
        setErrorMessage(null)

        // 1. Try to fetch existing certificate by ID or domain
        try {
          const certRes = await certificateService.getCertificate(targetParam)
          if (certRes?.certificate) {
            setCertificate(certRes.certificate)
            setLoading(false)
            return
          }
        } catch {
          // Fall through to domain lookup
        }

        // 2. Fetch domain metadata
        let currentDomain: Domain | undefined
        try {
          currentDomain = await domainService.getDomainBySlug(targetParam)
          if (currentDomain) setDomain(currentDomain)
        } catch {
          // ignore
        }

        // 3. Check user's earned certificates for this domain
        const userCerts = await certificateService.getUserCertificates()
        const existing = userCerts.certificates?.find(
          (c) => c.domainSlug === targetParam || c.domainId === targetParam || c.certificateId === targetParam || c.id === targetParam
        )

        if (existing) {
          setCertificate(existing)
        } else {
          // 4. Check real eligibility for certificate generation
          const elig = await certificateService.checkEligibility(targetParam)
          setEligibility(elig)
        }
      } catch (err: any) {
        console.error("Failed to load certificate context:", err)
        setErrorMessage("Could not load certificate information.")
      } finally {
        setLoading(false)
      }
    }

    loadCertificateData()
  }, [targetParam])

  // Handle Certificate Generation with animated steps
  const handleGenerateCertificate = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setErrorMessage(null)
    setGenerationStep(1)

    try {
      // Step 1: Verifying eligibility
      await new Promise((r) => setTimeout(r, 600))
      setGenerationStep(2)

      // Step 2: Generating ID & QR
      await new Promise((r) => setTimeout(r, 600))
      setGenerationStep(3)

      // Step 3: Rendering PDF on server
      const res = await certificateService.generateCertificate(targetParam)
      setGenerationStep(4)

      await new Promise((r) => setTimeout(r, 500))
      if (res?.certificate) {
        setCertificate(res.certificate)
      }
    } catch (err: any) {
      console.error("Certificate generation error:", err)
      setErrorMessage(err.response?.data?.message || "Failed to generate certificate. Please ensure all requirements are completed.")
    } finally {
      setIsGenerating(false)
      setGenerationStep(0)
    }
  }

  const handleCopyLink = (code: string) => {
    const fullUrl = `${window.location.origin}/verify/${code}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const domainDisplayName = domain?.name || certificate?.domainName || targetParam.replace(/-/g, " ").toUpperCase()
  const certCode = certificate?.certificateCode || certificate?.certificateId || ""

  return (
    <div className="space-y-8 pb-14 max-w-5xl mx-auto select-none">
      {/* Generation Animated Modal */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/80 rounded-3xl p-8 max-w-md w-full space-y-6 text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 animate-bounce">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Creating Your Certificate...</h3>
                <p className="text-xs text-muted-foreground">
                  Validating requirements, generating vector geometry, and embedding QR verification.
                </p>
              </div>

              {/* Steps Progress */}
              <div className="space-y-3 text-left text-xs font-semibold max-w-xs mx-auto">
                <div className="flex items-center gap-3">
                  {generationStep >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                  )}
                  <span className={generationStep >= 1 ? "text-foreground" : "text-muted-foreground"}>
                    Verifying learning milestones
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {generationStep >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : generationStep === 2 ? (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-muted shrink-0" />
                  )}
                  <span className={generationStep >= 2 ? "text-foreground" : "text-muted-foreground"}>
                    Generating unique certificate ID & QR
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {generationStep >= 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : generationStep === 3 ? (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-muted shrink-0" />
                  )}
                  <span className={generationStep >= 3 ? "text-foreground" : "text-muted-foreground"}>
                    Rendering high-resolution PDF
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/certificates")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Certificates</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/domains/${targetParam}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View Curriculum Roadmap</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setErrorMessage(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Loading certificate details...
          </p>
        </div>
      ) : certificate ? (
        /* ================= EARNED CERTIFICATE VIEW ================= */
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Achievement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {certificate.domainName} Certificate
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Issued to <strong className="text-foreground">{certificate.recipientName}</strong> on {certificate.issueDate}. Performance Score: <strong className="text-emerald-500">{certificate.score}%</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/api/certificates/${certificate.id}/download`}
                download={`PathLearn-${certCode}.pdf`}
                className="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>

              <Button
                variant="outline"
                onClick={() => handleCopyLink(certCode)}
                className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied" : "Copy Link"}</span>
              </Button>
            </div>
          </div>

          {/* Certificate Frame Preview */}
          <CertificatePreview certificate={certificate} />
        </div>
      ) : eligibility ? (
        /* ================= LOCKED / UNLOCKED GENERATION VIEW ================= */
        <div className="space-y-6 max-w-3xl mx-auto">
          {eligibility.eligible ? (
            /* Eligible Banner */
            <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-emerald-500/10 via-card to-indigo-500/10 border-2 border-emerald-500/40 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  🎉 Certificate Ready
                </span>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight mt-2">
                  Congratulations! You Are Eligible
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  You have fulfilled 100% of the curriculum milestones, assessments, and AI mock interview readiness.
                </p>
              </div>

              {/* Requirement Met Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Roadmap: 100%</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Quizzes: Passed</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interview: {eligibility.interviewScore}%</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={isGenerating}
                  className="bg-linear-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold px-8 py-3 shadow-lg gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Generate Official Certificate</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Locked Banner */
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {domainDisplayName} Certificate Locked
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Certificates are cryptographically issued only after fulfilling all 3 verified learning criteria.
                  </p>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-3 pt-2">
                {/* 1. Roadmap */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {eligibility.requirements.roadmap ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-foreground">1. Complete all roadmap steps</span>
                      <p className="text-[11px] text-muted-foreground">100% lessons and hands-on milestones</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-foreground">{eligibility.roadmapProgress}%</span>
                </div>

                {/* 2. Quizzes */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {eligibility.requirements.quizzes ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-foreground">2. Pass required topic quizzes</span>
                      <p className="text-[11px] text-muted-foreground">All module knowledge checks</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {eligibility.quizzesPassed ? "Passed ✓" : "Pending"}
                  </span>
                </div>

                {/* 3. AI Mock Interview */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {eligibility.requirements.interview ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-foreground">3. Score ≥60% in AI Mock Interview</span>
                      <p className="text-[11px] text-muted-foreground">Adaptive evaluation of technical aptitude</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {eligibility.interviewScore > 0 ? `${eligibility.interviewScore}%` : "Not Taken"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate(`/domains/${targetParam}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex-1 py-2.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Continue Roadmap</span>
                </Button>

                <Button
                  onClick={() => navigate(`/mock-interview/${targetParam}`)}
                  variant="outline"
                  className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted flex-1 py-2.5 gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Take Mock Interview</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
