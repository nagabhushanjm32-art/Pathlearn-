import { useState, useEffect, useRef, useCallback } from "react"

export function useInterviewTimer(targetMinutes: number = 20) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const startTimer = useCallback(() => setIsRunning(true), [])
  const pauseTimer = useCallback(() => setIsRunning(false), [])
  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`

  const isWarning = mins >= targetMinutes - 3 // warning within last 3 mins of target

  return {
    secondsElapsed: seconds,
    formattedTime,
    isRunning,
    isWarning,
    startTimer,
    pauseTimer,
    resetTimer,
  }
}

export default useInterviewTimer
