import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setElapsed(s => s + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    setElapsed(0)
  }, [])

  const setElapsedDirect = useCallback((s: number) => {
    setElapsed(s)
  }, [])

  return { elapsed, running, start, pause, reset, setElapsed: setElapsedDirect }
}
