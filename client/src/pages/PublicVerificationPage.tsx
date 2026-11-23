import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Search,
  Download,
  ArrowRight,
  ExternalLink,
  QrCode,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "../components/common/Logo"
import { Button } from "@/components/ui/button"
import { certificateService } from "../services/certificateService"
import { Certificate } from "../types"

export default function PublicVerificationPage() {
  const { certificateId } = useParams<{ certificateId?: string }>()
  const navigate = useNavigate()

  const [searchId, setSearchId] = useState<string>(certificateId || "")
  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(certificateId))
  const [hasSearched, setHasSearched] = useState<boolean>(Boolean(certificateId))
  const [statusResult, setStatusResult] = useState<"ACTIVE" | "REVOKED" | "NOT_FOUND" | "IDLE">(
    certificateId ? "IDLE" : "IDLE"
  )

  useEffect(() => {
    document.title = "Certificate Verification | PathLearn"
  }, [])

  useEffect(() => {
    if (!certificateId || !certificateId.trim()) {
      setLoading(false)
      setHasSearched(false)
      setCert(null)
      setStatusResult("IDLE")
      return
    }

    async function verify() {
      setLoading(true)
      setHasSearched(true)
      try {
        const res = await certificateService.verifyCertificate(certificateId!)
        if (res.authentic && res.certificate) {
          setCert(res.certificate)
          setStatusResult("ACTIVE")
        } else if (res.status === "REVOKED") {
          setCert(res.certificate || null)
          setStatusResult("REVOKED")
        } else {
          setCert(null)
          setStatusResult("NOT_FOUND")
        }
      } catch {
        setCert(null)
        setStatusResult("NOT_FOUND")
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [certificateId])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchId.trim()
    if (!trimmed) return
    navigate(`/verify/${trimmed}`)
  }

  const certCode = cert?.certificateCode || cert?.certificateId || certificateId || ""

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 sm:pb-8">
        <Logo size="md" />
        <Link
          to="/login"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Sign in to PathLearn
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto space-y-6">
        {/* Search Bar Bar */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Verification Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Verify a PathLearn Certificate
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter any official PathLearn credential ID to verify student authenticity and graduation status.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. PL-AI-2026-X7K92"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/60 border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-5 shrink-0"
            >
              Verify
            </Button>
          </form>
        </div>

        {/* Verification Result Card */}
        {loading ? (
          <div className="p-12 rounded-3xl bg-card border border-border/80 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-muted-foreground animate-pulse">
              Querying cryptographic credential records...
            </p>
          </div>
        ) : hasSearched && statusResult === "ACTIVE" && cert ? (
          /* ================= VERIFIED SUCCESS ================= */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-emerald-500/40 shadow-xl space-y-6 relative overflow-hidden text-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Green Verified Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ✓ Verified Credential
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
                Authentic PathLearn Certificate
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                This credential is cryptographically authentic and officially issued by PathLearn AI Academy.
              </p>
            </div>

            {/* Verification Detail Grid */}
            <div className="pt-4 border-t border-border/80 text-left grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Certificate ID</span>
                <p className="font-mono font-bold text-indigo-400">{certCode}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Recipient Name</span>
                <p className="font-bold text-foreground text-sm">{cert.recipientName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Certified Track / Role</span>
                <p className="font-bold text-indigo-400">{cert.roleName || cert.domainName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Performance Score</span>
                <p className="font-bold text-emerald-400">{cert.score}%</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Curriculum Completion</span>
                <p className="font-medium text-foreground">100% Verified</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Issue Date</span>
                <p className="font-medium text-foreground">{cert.issueDate}</p>
              </div>
            </div>

            {/* Skills demonstrated */}
            {cert.skillsDemonstrated && cert.skillsDemonstrated.length > 0 && (
              <div className="pt-4 border-t border-border/60 text-left">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Verified Skills Demonstrated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cert.skillsDemonstrated.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-semibold bg-muted/80 text-foreground px-2.5 py-1 rounded-full border border-border"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download and Explorer Action Links */}
            <div className="pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`/api/certificates/${cert.id || certCode}/download`}
                download={`PathLearn-${certCode}.pdf`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </a>

              <Link
                to="/domains"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold"
              >
                <span>Explore PathLearn Academy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ) : hasSearched && statusResult === "REVOKED" ? (
          /* ================= REVOKED ================= */
          <div className="p-8 rounded-3xl bg-card border-2 border-amber-500/40 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Certificate Revoked</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                This certificate (ID: <strong className="font-mono text-foreground">{certCode}</strong>) is no longer active or has been officially revoked.
              </p>
            </div>
          </div>
        ) : hasSearched && statusResult === "NOT_FOUND" ? (
          /* ================= NOT FOUND ================= */
          <div className="p-8 rounded-3xl bg-card border border-rose-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Certificate Not Found</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                The certificate ID you entered (<strong className="font-mono text-foreground">{certificateId}</strong>) could not be verified in our records. Please double check the ID.
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6">
        © 2026 PathLearn AI Academy. All rights reserved. Secure Cryptographic Verification Portal.
      </footer>
    </div>
  )
}
