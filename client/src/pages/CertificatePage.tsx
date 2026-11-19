import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Award, Lock, ShieldAlert } from "lucide-react"
import { CertificatePreview } from "../components/certificates/CertificatePreview"
import { certificateService } from "../services/certificateService"
import { domainService } from "../services/domainService"
import { useAuth } from "../context/AuthContext"
import { Certificate, Domain } from "../types"
import { Button } from "@/components/ui/button"

export default function CertificatePage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentSlug = domainId || "ai-engineer"

  const [domain, setDomain] = useState<Domain | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // 1. Fetch domain metadata
        let currentDomain: Domain | undefined
        try {
          currentDomain = await domainService.getDomainBySlug(currentSlug)
          if (currentDomain) {
            setDomain(currentDomain)
          }
        } catch (dErr) {
          console.warn("Domain fetch error in CertificatePage:", dErr)
        }

        // 2. Fetch or dynamically construct certificate for active user and domain
        const cert = await certificateService.getCertificateByDomain(
          currentSlug,
          user?.name,
          currentDomain?.name,
          currentDomain?.skillTags
        )

        if (cert) {
          // Guarantee logged-in user name and domain name are reflected
          const updatedCert: Certificate = {
            ...cert,
            recipientName: user?.name || cert.recipientName || "Student Graduate",
            domainName: currentDomain?.name || cert.domainName,
            domainSlug: currentDomain?.slug || cert.domainSlug || currentSlug,
            skillsDemonstrated:
              currentDomain?.skillTags && currentDomain.skillTags.length > 0
                ? currentDomain.skillTags
                : cert.skillsDemonstrated,
          }
          setCertificate(updatedCert)
        }
      } catch (err) {
        console.error("Failed to load certificate:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentSlug, user?.name])

  const domainDisplayName = domain?.name || certificate?.domainName || "Curriculum Track"

  return (
    <div className="space-y-8 pb-14 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(`/domains/${currentSlug}`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to {domainDisplayName} Roadmap</span>
      </button>

      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
          <Award className="w-4 h-4" />
          <span>Official PathLearn Credential</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Verifiable Certificate of Completion
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Issued to <strong className="text-foreground">{user?.name || "Candidate"}</strong> for verified mastery in{" "}
          <strong className="text-indigo-400">{domainDisplayName}</strong>.
        </p>
      </div>

      {/* Locked / Preview Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">Certificate Status: Preview Template</h4>
            <p className="text-[11px] text-muted-foreground">
              Complete 100% of the {domainDisplayName} roadmap, pass all module quizzes, and score ≥60% on the AI Mock Interview to permanently issue and anchor your credential.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => navigate(`/domains/${currentSlug}`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
        >
          View Roadmap
        </Button>
      </div>

      {/* Certificate Frame Preview */}
      {certificate ? (
        <CertificatePreview certificate={certificate} />
      ) : loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">
          Loading certificate preview...
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-card border border-border/80 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Certificate Issued Yet</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Certificates are dynamically generated and issued only after fulfilling all curriculum milestones and evaluation criteria.
          </p>
          <Button onClick={() => navigate(`/domains/${currentSlug}`)}>
            Return to Learning
          </Button>
        </div>
      )}
    </div>
  )
}
