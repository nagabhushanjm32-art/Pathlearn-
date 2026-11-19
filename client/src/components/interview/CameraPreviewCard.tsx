import React, { useEffect, useRef } from "react"
import { Camera, CameraOff, Mic, MicOff, User, Radio } from "lucide-react"
import { motion } from "framer-motion"
import { useAudioVisualizer } from "../../hooks/useAudioVisualizer"

interface CameraPreviewCardProps {
  stream: MediaStream | null
  cameraEnabled: boolean
  micEnabled: boolean
  onToggleCamera: () => void
  onToggleMic: () => void
  userName?: string
  isListening?: boolean
}

export const CameraPreviewCard: React.FC<CameraPreviewCardProps> = ({
  stream,
  cameraEnabled,
  micEnabled,
  onToggleCamera,
  onToggleMic,
  userName = "Student",
  isListening = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { frequencyData, isSpeaking } = useAudioVisualizer(micEnabled ? stream : null, {
    numBars: 14,
  })

  // Attach MediaStream to local video element
  useEffect(() => {
    if (videoRef.current) {
      if (stream && cameraEnabled) {
        videoRef.current.srcObject = stream
      } else {
        videoRef.current.srcObject = null
      }
    }
  }, [stream, cameraEnabled])

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative rounded-3xl bg-card border border-border/80 shadow-md overflow-hidden flex flex-col group">
      {/* Video Viewport Area */}
      <div className="relative h-[165px] sm:h-[185px] w-full bg-slate-950 flex items-center justify-center overflow-hidden rounded-t-3xl">
        {stream && cameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 select-none">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
              <span className="text-xl font-extrabold tracking-wider">{initials}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">{userName}</p>
              <p className="text-[10px] text-muted-foreground">Camera feed is off</p>
            </div>
          </div>
        )}

        {/* Live Audio Waveform Overlay at Bottom of Video */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 z-10">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                micEnabled && isListening
                  ? "bg-rose-500 animate-ping"
                  : micEnabled
                  ? "bg-emerald-500"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {micEnabled ? (isListening ? "Listening" : "Mic Ready") : "Mic Muted"}
            </span>
          </div>

          {/* Real Audio Waveform Equalizer */}
          <div className="flex items-center gap-0.5 h-4">
            {frequencyData.map((val, idx) => {
              const height = Math.max(3, Math.min(16, Math.round((val / 100) * 16)))
              return (
                <motion.div
                  key={idx}
                  animate={{ height }}
                  transition={{ duration: 0.08 }}
                  className={`w-1 rounded-full ${
                    isListening || isSpeaking
                      ? "bg-rose-400"
                      : micEnabled
                      ? "bg-emerald-400"
                      : "bg-white/20"
                  }`}
                  style={{ height: `${height}px` }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 sm:p-4 bg-card flex items-center justify-between gap-2 border-t border-border/60">
        <div className="flex items-center gap-2">
          {/* Toggle Camera Button */}
          <button
            type="button"
            onClick={onToggleCamera}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cameraEnabled
                ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
            }`}
            title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {cameraEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">
              {cameraEnabled ? "Camera ON" : "Camera OFF"}
            </span>
          </button>

          {/* Toggle Mic Button */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              micEnabled
                ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
            }`}
            title={micEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {micEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-500" /> : <MicOff className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">
              {micEnabled ? "Mic ON" : "Mic OFF"}
            </span>
          </button>
        </div>

        {/* Local Stream Security Badge */}
        <span className="text-[10px] text-muted-foreground font-medium hidden md:inline">
          🔒 Local Video Stream
        </span>
      </div>
    </div>
  )
}

export default CameraPreviewCard
