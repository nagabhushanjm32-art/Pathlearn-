import { useState, useEffect, useRef } from "react"

interface UseAudioVisualizerOptions {
  numBars?: number
  smoothingTimeConstant?: number
  fftSize?: number
}

export function useAudioVisualizer(
  stream: MediaStream | null,
  options: UseAudioVisualizerOptions = {}
) {
  const { numBars = 12, smoothingTimeConstant = 0.8, fftSize = 64 } = options

  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(numBars).fill(0))
  const [volume, setVolume] = useState<number>(0)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setFrequencyData(new Array(numBars).fill(0))
      setVolume(0)
      setIsSpeaking(false)
      return
    }

    // Check if audio track is enabled
    const audioTrack = stream.getAudioTracks()[0]
    if (!audioTrack || !audioTrack.enabled) {
      setFrequencyData(new Array(numBars).fill(0))
      setVolume(0)
      setIsSpeaking(false)
      return
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      const audioCtx = new AudioCtx()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = fftSize
      analyser.smoothingTimeConstant = smoothingTimeConstant

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.current = audioCtx
      analyserRef.current = analyser
      sourceRef.current = source

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateData = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate discrete bar heights
        const step = Math.floor(dataArray.length / numBars)
        const bars: number[] = []
        let total = 0

        for (let i = 0; i < numBars; i++) {
          const val = dataArray[i * step] || 0
          // Normalized 0 to 100
          const normalized = Math.round((val / 255) * 100)
          bars.push(normalized)
          total += normalized
        }

        const avg = Math.round(total / numBars)
        setFrequencyData(bars)
        setVolume(avg)
        setIsSpeaking(avg > 15)

        animationFrameRef.current = requestAnimationFrame(updateData)
      }

      updateData()
    } catch (err) {
      console.warn("Audio visualizer initialization failed:", err)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [stream, numBars, smoothingTimeConstant, fftSize])

  return {
    frequencyData,
    volume,
    isSpeaking,
  }
}

export default useAudioVisualizer
