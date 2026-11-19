import { useState, useEffect, useRef, useCallback } from "react"

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  lang?: string
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onResult, onError, lang = "en-US" } = options

  const [isListening, setIsListening] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [interimTranscript, setInterimTranscript] = useState<string>("")
  const [isSupported, setIsSupported] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLang, setCurrentLang] = useState<string>(lang)

  const recognitionRef = useRef<any>(null)
  const shouldListenRef = useRef<boolean>(false)
  const accumulatedRef = useRef<string>("")
  const currentPhraseFinalRef = useRef<string>("")
  const restartTimerRef = useRef<any>(null)
  const networkErrorCountRef = useRef<number>(0)

  // Check browser Web Speech API support
  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setIsSupported(false)
    }
  }, [])

  // Create and start SpeechRecognition instance
  const createAndStartRecognition = useCallback(() => {
    if (typeof window === "undefined") return

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionClass) {
      setIsSupported(false)
      setError("Speech recognition is not supported in this browser.")
      return
    }

    // Clean up any stale recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }

    try {
      const recognition = new SpeechRecognitionClass()
      // continuous: false prevents Google Speech server WebSocket network drops
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = currentLang || "en-US"
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: any) => {
        let currentInterim = ""
        let newFinal = ""

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i]
          const text = item[0]?.transcript || ""
          if (item.isFinal) {
            newFinal += (newFinal ? " " : "") + text.trim()
          } else {
            currentInterim += (currentInterim ? " " : "") + text.trim()
          }
        }

        if (newFinal) {
          currentPhraseFinalRef.current = [currentPhraseFinalRef.current, newFinal].filter(Boolean).join(" ").trim()
        }

        // Full accumulated history + current phrase
        const base = accumulatedRef.current
        const activeCombined = [base, currentPhraseFinalRef.current].filter(Boolean).join(" ").trim()

        if (activeCombined) {
          setTranscript(activeCombined)
        }

        setInterimTranscript(currentInterim)

        const totalActive = [activeCombined, currentInterim].filter(Boolean).join(" ").trim()
        if (onResult && totalActive) {
          onResult(totalActive)
        }
      }

      recognition.onerror = (event: any) => {
        const errType = event.error || "unknown"

        // 'no-speech' or 'aborted' are normal pauses
        if (errType === "no-speech" || errType === "aborted") {
          return
        }

        if (errType === "network") {
          networkErrorCountRef.current += 1
          // If network error occurred, switch to en-US if not already
          if (currentLang !== "en-US") {
            setCurrentLang("en-US")
          }
          if (networkErrorCountRef.current >= 4) {
            setError("Cloud speech connection is slow. Audio is recorded directly via microphone.")
          }
          if (onError) onError("network")
          return
        }

        if (errType === "not-allowed" || errType === "service-not-allowed") {
          shouldListenRef.current = false
          setIsListening(false)
          setError("Microphone permission was denied. Please allow microphone in browser.")
          if (onError) onError(errType)
          return
        }

        setError(errType)
        if (onError) onError(errType)
      }

      recognition.onend = () => {
        // Commit current phrase to accumulated history on phrase boundary
        if (currentPhraseFinalRef.current) {
          accumulatedRef.current = [accumulatedRef.current, currentPhraseFinalRef.current]
            .filter(Boolean)
            .join(" ")
            .trim()
          currentPhraseFinalRef.current = ""
        }

        // Auto restart immediately if continuous listening is enabled
        if (shouldListenRef.current) {
          clearTimeout(restartTimerRef.current)
          const delay = networkErrorCountRef.current > 3 ? 1500 : 80
          restartTimerRef.current = setTimeout(() => {
            if (shouldListenRef.current) {
              createAndStartRecognition()
            }
          }, delay)
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err: any) {
      console.warn("SpeechRecognition start exception:", err)
      setError(err?.message || "Failed to start speech recognition.")
      setIsListening(false)
    }
  }, [currentLang, onError, onResult])

  const startListening = useCallback(async () => {
    shouldListenRef.current = true
    setIsListening(true)
    networkErrorCountRef.current = 0
    setError(null)
    clearTimeout(restartTimerRef.current)
    createAndStartRecognition()
  }, [createAndStartRecognition])

  const stopListening = useCallback(() => {
    shouldListenRef.current = false
    clearTimeout(restartTimerRef.current)

    // Flush current phrase to accumulated
    if (currentPhraseFinalRef.current) {
      accumulatedRef.current = [accumulatedRef.current, currentPhraseFinalRef.current]
        .filter(Boolean)
        .join(" ")
        .trim()
      currentPhraseFinalRef.current = ""
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    accumulatedRef.current = ""
    currentPhraseFinalRef.current = ""
    setTranscript("")
    setInterimTranscript("")
  }, [])

  const setManualTranscript = useCallback((text: string) => {
    accumulatedRef.current = text
    currentPhraseFinalRef.current = ""
    setTranscript(text)
    setInterimTranscript("")
  }, [])

  const appendTranscript = useCallback((text: string) => {
    const updated = [accumulatedRef.current, text].filter(Boolean).join(" ").trim()
    accumulatedRef.current = updated
    currentPhraseFinalRef.current = ""
    setTranscript(updated)
    setInterimTranscript("")
  }, [])

  const toggleLang = useCallback(() => {
    const nextLang = currentLang === "en-IN" ? "en-US" : "en-IN"
    setCurrentLang(nextLang)
    if (shouldListenRef.current) {
      setTimeout(() => {
        createAndStartRecognition()
      }, 150)
    }
  }, [currentLang, createAndStartRecognition])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      clearTimeout(restartTimerRef.current)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const fullTranscript = (
    transcript + (interimTranscript ? ` ${interimTranscript}` : "")
  ).trim()

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    isSupported,
    error,
    currentLang,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
    appendTranscript,
    toggleLang,
  }
}

export default useSpeechRecognition
