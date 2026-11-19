import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Mic,
  Camera,
  Shield,
  Clock,
  Brain,
  CheckCircle2,
  Play,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Volume2,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { domainService } from "../services/domainService"
import { interviewService } from "../services/interviewService"
import { useCameraStream } from "../hooks/useCameraStream"
import { Domain } from "../types"

export default function InterviewSetupPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const currentSlug = domainId || "ai-engineer"

  const [domain, setDomain] = useState<Domain | null>(null)
  const [difficulty, setDifficulty] = useState<string>("INTERMEDIATE")
  const [interviewType, setInterviewType] = useState<string>("TECHNICAL")
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  const {
    stream,
    hasCameraPermission,
    hasMicPermission,
    isPending: isRequestingMedia,
    error: mediaError,
    requestPermissions,
  } = useCameraStream()

  const previewVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    async function loadDomain() {
      try {
        const data = await domainService.getDomainBySlug(currentSlug)
        if (data) setDomain(data)
      } catch (err) {
        console.error("Failed to load domain info for setup:", err)
      }
    }
    loadDomain()
  }, [currentSlug])

  // Attach local stream to video preview element
  useEffect(() => {
    if (previewVideoRef.current && stream) {
      previewVideoRef.current.srcObject = stream
    }
  }, [stream])

  const domainName = domain?.name || (
    currentSlug === "ai-engineer"
      ? "AI Engineer"
      : currentSlug === "machine-learning"
      ? "Machine Learning"
      : currentSlug === "python-development"
      ? "Python Development"
      : currentSlug === "data-science"
      ? "Data Science & Analytics"
      : "Technical Engineering"
  )

  const handleStartInterview = async () => {
    setIsStarting(true)
    setStartError(null)
    try {
      const res = await interviewService.createInterview({
        domainSlug: currentSlug,
        difficulty,
        type: interviewType,
      })

      if (res?.interview?.id) {
        navigate(`/interview/${res.interview.id}`)
      } else {
        throw new Error("Invalid interview session created")
      }
    } catch (err: any) {
      console.error("Failed to initialize interview session:", err)
      setStartError(err.response?.data?.message || "Could not start interview session. Please try again.")
      setIsStarting(false)
    }
  }

  const isHardwareReady = hasCameraPermission && hasMicPermission

  return (
    <div className="space-y-8 pb-14 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(`/domains/${currentSlug}`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Roadmap</span>
      </button>

      {/* Hero Header */}
      <div className="p-8 rounded-3xl bg-linear-to-br from-indigo-950/60 via-card to-purple-950/50 border border-indigo-500/30 text-center space-y-4 relative overflow-hidden shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
          <Brain className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            PathLearn AI Assessment
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            AI MOCK INTERVIEW
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Test your readiness with an adaptive AI interview. The interviewer assesses technical depth, dynamic trade-offs, and communication.
          </p>
        </div>

        {/* Quick Specs Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-indigo-500" />
            5–8 Adaptive Questions
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Brain className="w-4 h-4 text-indigo-500" />
            ~15–20 Minutes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-4 h-4 text-emerald-500" />
            Score ≥60% Unlocks Certificate
          </span>
        </div>
      </div>

      {/* Two Column Setup Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Interview Specifications */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Interview Profile
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60">
              <span className="text-muted-foreground font-medium">Domain Track:</span>
              <span className="font-bold text-foreground">{domainName}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60">
              <span className="text-muted-foreground font-medium">Questions:</span>
              <span className="font-bold text-foreground">5–8 Adaptive Questions</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60">
              <span className="text-muted-foreground font-medium">Duration:</span>
              <span className="font-bold text-foreground">Approximately 15–20 minutes</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60">
              <span className="text-muted-foreground font-medium">Interview Type:</span>
              <span className="font-bold text-foreground">Technical + Scenario Based</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <h3 className="text-xs font-bold text-foreground">AI Evaluation Metrics</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Technical Knowledge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Problem Solving</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Communication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Concept Understanding</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Hardware & Permissions Check */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-500" />
              Device Connection
            </h2>

            {/* Hardware Status Indicators */}
            <div className="grid grid-cols-2 gap-3">
              {/* Camera Status */}
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">Camera</span>
                  <Camera className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasCameraPermission ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">
                    {hasCameraPermission ? "● Ready" : "○ Not connected"}
                  </span>
                </div>
              </div>

              {/* Microphone Status */}
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">Microphone</span>
                  <Mic className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasMicPermission ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">
                    {hasMicPermission ? "● Ready" : "○ Not connected"}
                  </span>
                </div>
              </div>
            </div>

            {/* Camera Preview Area if connected */}
            {stream && hasCameraPermission ? (
              <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative shadow-inner border border-border/60">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Camera Live Preview
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={requestPermissions}
                disabled={isRequestingMedia}
                className="w-full py-3 rounded-2xl border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 font-semibold text-xs gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{isRequestingMedia ? "Requesting Permissions..." : "Enable Camera & Microphone"}</span>
              </Button>
            )}

            {mediaError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{mediaError} You can still continue in text-answer mode.</span>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2">
            <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Privacy Assurance:</strong> Your camera is used for the interview interface. Your spoken response is transcribed and analyzed by AI. Video is never uploaded or saved.
            </p>
          </div>
        </div>
      </div>

      {/* Start Interview Action Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Ready to test your knowledge?</h3>
          <p className="text-xs text-muted-foreground">
            The interview begins with Question 1 and dynamically adapts to your responses.
          </p>
          {startError && <p className="text-xs text-rose-500 font-medium mt-1">{startError}</p>}
        </div>

        <Button
          onClick={handleStartInterview}
          disabled={isStarting}
          className="w-full sm:w-auto bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl px-8 py-3.5 text-xs font-bold shadow-md gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isStarting ? "Initiating Session..." : "Start Interview"}</span>
        </Button>
      </div>
    </div>
  )
}
