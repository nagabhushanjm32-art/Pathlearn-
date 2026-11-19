import React, { useState } from "react"
import { Award, Download, Share2, Check, ExternalLink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Certificate } from "../../types"

interface CertificatePreviewProps {
  certificate: Certificate
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ certificate }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/verify/${certificate.certificateId}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrintDownload = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Certificate Frame Container */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-linear-to-br from-amber-500/10 via-background to-purple-500/10 border-4 border-amber-500/30 shadow-2xl overflow-hidden max-w-4xl mx-auto">
        {/* Ornate corner embellishments */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

        {/* Certificate Content */}
        <div className="text-center space-y-6 relative z-10 py-4">
          {/* Header */}
          <div>
            <div className="inline-flex items-center justify-center gap-2 mb-2 text-indigo-500">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              <span className="text-sm font-black tracking-widest uppercase">PATHLEARN ACADEMY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-foreground uppercase mt-1">
              Certificate of Completion
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest mt-2 font-medium">
              This is to certify that
            </p>
          </div>

          {/* Recipient Name */}
          <div className="py-2">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight underline decoration-amber-500/40 underline-offset-8">
              {certificate.recipientName}
            </h2>
          </div>

          {/* Achievement Description */}
          <div className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
            has successfully completed the comprehensive AI-curated curriculum, rigorous quizzes, and AI mock interview evaluations for
            <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {certificate.domainName}
            </div>
            <span className="text-xs text-muted-foreground block mt-1">
              and has demonstrated verified mastery of industry-standard skills.
            </span>
          </div>

          {/* Key Skills Demonstrated */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto pt-1">
            {certificate.skillsDemonstrated.map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-semibold bg-muted/80 text-foreground px-2.5 py-1 rounded-full border border-border"
              >
                ✓ {skill}
              </span>
            ))}
          </div>

          {/* Footer with Seal, QR & Signatures */}
          <div className="pt-8 border-t border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Meta Info */}
            <div className="text-left space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Score: <span className="text-emerald-500">{certificate.score}%</span>
              </p>
              <p className="text-xs text-muted-foreground">Date: {certificate.issueDate}</p>
              <p className="text-[11px] font-mono text-muted-foreground">ID: {certificate.certificateId}</p>
            </div>

            {/* Official Gold Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center text-amber-950 shadow-lg shadow-amber-500/20 border-2 border-yellow-200 animate-pulse">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400 mt-1">
                CERTIFIED AI
              </span>
            </div>

            {/* QR Code & Signature */}
            <div className="flex items-center justify-end gap-3">
              {certificate.qrCodeUrl && (
                <div className="w-16 h-16 rounded-xl bg-white p-1 border border-border shadow-xs shrink-0">
                  <img
                    src={certificate.qrCodeUrl}
                    alt="Certificate QR Verification"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="text-right">
                <div className="font-serif italic text-base font-bold text-foreground">
                  PathLearn AI
                </div>
                <div className="text-[10px] text-muted-foreground border-t border-border/80 pt-0.5">
                  Academic Director
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PDF & Share */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={handlePrintDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 shadow-md gap-2 text-xs font-semibold"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="rounded-xl px-6 py-2.5 border-border text-foreground hover:bg-muted gap-2 text-xs font-semibold"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Link Copied!" : "Share Certificate"}
        </Button>

        <a
          href={`/verify/${certificate.certificateId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-indigo-500 py-2.5 px-3"
        >
          <span>Public Verification Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

export default CertificatePreview
