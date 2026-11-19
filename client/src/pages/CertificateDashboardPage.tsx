import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  Copy,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { certificateService } from "../services/certificateService"
import { Certificate } from "../types"

export default function CertificateDashboardPage() {
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [shareModalCert, setShareModalCert] = useState<Certificate | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true)
        const res = await certificateService.getUserCertificates()
        if (res?.certificates) {
          setCertificates(res.certificates)
        }
      } catch (err) {
        console.error("Failed to load user certificates:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [])

  const handleCopyLink = (certCode: string) => {
    const fullUrl = `${window.location.origin}/verify/${certCode}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleNativeShare = async (cert: Certificate) => {
    const fullUrl = `${window.location.origin}/verify/${cert.certificateCode || cert.certificateId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cert.domainName} - PathLearn Certificate`,
          text: `I just earned my verified Certificate of Completion in ${cert.domainName} with a score of ${cert.score}% on PathLearn! Check out my credential:`,
          url: fullUrl,
        })
        return
      } catch {
        // Fall through to modal
      }
    }
    setShareModalCert(cert)
  }

  return (
    <div className="space-y-8 pb-14 max-w-6xl mx-auto select-none">
      {/* Share Modal Dialog */}
      <AnimatePresence>
        {shareModalCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  <Share2 className="w-4 h-4" />
                  <span>Share Achievement</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShareModalCert(null)}
                  className="text-muted-foreground hover:text-foreground text-xs font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {shareModalCert.domainName} Certificate
                </h3>
                <p className="text-xs text-muted-foreground">
                  Share your public verification link with recruiters, peers, and social networks.
                </p>
              </div>

              {/* Public verification URL box */}
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="truncate text-foreground/80">
                  {window.location.origin}/verify/{shareModalCert.certificateCode || shareModalCert.certificateId}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleCopyLink(shareModalCert.certificateCode || shareModalCert.certificateId)}
                  className="rounded-xl text-[11px] h-8 gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `${window.location.origin}/verify/${shareModalCert.certificateCode || shareModalCert.certificateId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-500 text-xs font-semibold transition-colors"
                >
                  <span className="font-bold text-sm">in</span>
                  <span className="text-[10px] mt-0.5">LinkedIn</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out my verified ${shareModalCert.domainName} Certificate on PathLearn: ${window.location.origin}/verify/${
                      shareModalCert.certificateCode || shareModalCert.certificateId
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold transition-colors"
                >
                  <span className="font-bold text-sm">WA</span>
                  <span className="text-[10px] mt-0.5">WhatsApp</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    `Verified Certificate: ${shareModalCert.domainName} - PathLearn`
                  )}&body=${encodeURIComponent(
                    `Hi,\n\nI recently completed the ${shareModalCert.domainName} track on PathLearn with a performance score of ${shareModalCert.score}%.\n\nYou can view and verify my authentic certificate here:\n${window.location.origin}/verify/${
                      shareModalCert.certificateCode || shareModalCert.certificateId
                    }\n\nBest regards,\n${shareModalCert.recipientName}`
                  )}`}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-500 text-xs font-semibold transition-colors"
                >
                  <span className="font-bold text-sm">@</span>
                  <span className="text-[10px] mt-0.5">Email</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>PathLearn Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            My Certificates
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your verified PathLearn achievements. Cryptographically anchored and publicly verifiable.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <Button
            onClick={() => navigate("/domains")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Earn New Certificate</span>
          </Button>
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Loading your verified achievements...
          </p>
        </div>
      ) : certificates.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 rounded-3xl bg-card border border-border/80 shadow-xs text-center space-y-5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">No Certificates Yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Complete a learning path and pass your AI interview to earn your first verified certificate.
            </p>
          </div>
          <Button
            onClick={() => navigate("/domains")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 py-2.5 shadow-sm gap-2"
          >
            <span>Explore Learning Paths</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const certCode = cert.certificateCode || cert.certificateId
            const downloadUrl = `/api/certificates/${cert.id}/download`

            return (
              <motion.div
                key={cert.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-xl hover:border-amber-500/40 transition-all p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">
                      {cert.domainName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      PathLearn Professional Certificate
                    </p>
                  </div>

                  {/* Metadata pill box */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Performance Score</span>
                      <span className="font-bold text-emerald-500">{cert.score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Issued Date</span>
                      <span className="font-medium text-foreground">{cert.issueDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground font-mono">ID</span>
                      <span className="font-mono font-bold text-indigo-400 text-[11px]">{certCode}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-border/60 grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => navigate(`/certificates/${cert.id}`)}
                    variant="outline"
                    className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted gap-1 px-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Button>

                  <a
                    href={downloadUrl}
                    download={`PathLearn-${certCode}.pdf`}
                    className="inline-flex items-center justify-center gap-1 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-2 py-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  <Button
                    onClick={() => handleNativeShare(cert)}
                    variant="outline"
                    className="rounded-xl text-xs font-semibold border-border text-foreground hover:bg-muted gap-1 px-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
