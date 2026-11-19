import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ShieldCheck, CheckCircle2, Award, ExternalLink, ArrowRight } from "lucide-react"
import { Logo } from "../components/common/Logo"
import { certificateService } from "../services/certificateService"
import { Certificate } from "../types"
import { Button } from "@/components/ui/button"

export default function CertificateVerifyPage() {
  const { certificateId } = useParams<{ certificateId: string }>()
  const currentId = certificateId || "PL-ML-8F42A91"

  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkVerification() {
      try {
        const found = await certificateService.verifyCertificate(currentId)
        if (found?.certificate) {
          setCert(found.certificate)
        }
      } catch (err) {
        console.error("Verification failed", err)
      } finally {
        setLoading(false)
      }
    }
    checkVerification()
  }, [currentId])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-8">
        <Logo size="md" />
        <Link
          to="/login"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Sign in to PathLearn
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-2xl w-full mx-auto space-y-6">
        {/* Verified Status Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-emerald-500/30 shadow-xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Green Verified Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Certificate Verified
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              This certificate is authentic, issued by PathLearn AI Academy, and cryptographically verified.
            </p>
          </div>

          {/* Verification Table */}
          {cert && (
            <div className="mt-6 pt-6 border-t border-border/80 text-left">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Certificate ID</span>
                  <p className="font-mono font-bold text-foreground">{cert.certificateId}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Recipient Name</span>
                  <p className="font-bold text-foreground">{cert.recipientName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Learning Domain</span>
                  <p className="font-bold text-indigo-500">{cert.domainName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Evaluation Score</span>
                  <p className="font-bold text-emerald-500">{cert.score}%</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Issued On</span>
                  <p className="font-medium text-foreground">{cert.issueDate}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    VALID
                  </span>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="mt-6 pt-4 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Verified Skills Demonstrated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cert.skillsDemonstrated.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold bg-muted/80 text-foreground px-2 py-0.5 rounded-md border border-border"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {cert && (
              <Link
                to={`/certificate/${cert.domainSlug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Award className="w-4 h-4" />
                <span>View Full Certificate</span>
              </Link>
            )}

            <Link
              to="/domains"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6">
        © 2026 PathLearn AI Academy. All rights reserved. Secure Verification Node.
      </footer>
    </div>
  )
}
