import { useState, useEffect, useRef, useCallback } from "react"

export function useCameraStream() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false)
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false)
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true)
  const [micEnabled, setMicEnabled] = useState<boolean>(true)
  const [isPending, setIsPending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)

  const requestPermissions = useCallback(async (): Promise<MediaStream | null> => {
    setIsPending(true)
    setError(null)

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera and microphone access is not supported on this browser.")
      setIsPending(false)
      return null
    }

    try {
      // 1. Try requesting both video and audio
      let mediaStream: MediaStream | null = null
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch (videoError: any) {
        console.warn("Combined video+audio failed, attempting audio-only:", videoError)
        // 2. Fallback to audio-only if video is unavailable/denied
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          })
        } catch (audioError: any) {
          throw audioError
        }
      }

      if (mediaStream) {
        streamRef.current = mediaStream
        setStream(mediaStream)
        setHasCameraPermission(mediaStream.getVideoTracks().length > 0)
        setHasMicPermission(mediaStream.getAudioTracks().length > 0)
        setCameraEnabled(mediaStream.getVideoTracks().length > 0)
        setMicEnabled(mediaStream.getAudioTracks().length > 0)
        setIsPending(false)
        return mediaStream
      }

      setIsPending(false)
      return null
    } catch (err: any) {
      console.warn("Camera/mic permission request failed completely:", err)
      let msg = "Could not access microphone or camera."
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Microphone permission was denied by browser. Please allow microphone access in browser address bar."
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No microphone or camera input device found on this system."
      }
      setError(msg)
      setIsPending(false)
      return null
    }
  }, [])

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return
    const videoTracks = streamRef.current.getVideoTracks()
    if (videoTracks.length === 0) return

    const newState = !videoTracks[0].enabled
    videoTracks.forEach((track) => {
      track.enabled = newState
    })
    setCameraEnabled(newState)
  }, [])

  const toggleMic = useCallback(() => {
    if (!streamRef.current) return
    const audioTracks = streamRef.current.getAudioTracks()
    if (audioTracks.length === 0) return

    const newState = !audioTracks[0].enabled
    audioTracks.forEach((track) => {
      track.enabled = newState
    })
    setMicEnabled(newState)
  }, [])

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // ignore
        }
      })
      streamRef.current = null
      setStream(null)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopAllTracks()
    }
  }, [stopAllTracks])

  return {
    stream,
    hasCameraPermission,
    hasMicPermission,
    cameraEnabled,
    micEnabled,
    isPending,
    error,
    requestPermissions,
    toggleCamera,
    toggleMic,
    stopAllTracks,
  }
}

export default useCameraStream
