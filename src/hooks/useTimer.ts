import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startTimeRef = useRef<number>(0)
  const baseElapsedRef = useRef<number>(0)

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now()
      const interval = setInterval(() => {
        const now = Date.now()
        setElapsed(baseElapsedRef.current + Math.floor((now - startTimeRef.current) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [running])

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setRunning(true)
  }, [])

  const pause = useCallback(() => {
    if (running) {
      const now = Date.now()
      baseElapsedRef.current = baseElapsedRef.current + Math.floor((now - startTimeRef.current) / 1000)
      setElapsed(baseElapsedRef.current)
    }
    setRunning(false)
  }, [running])

  const reset = useCallback(() => {
    setRunning(false)
    setElapsed(0)
    baseElapsedRef.current = 0
    startTimeRef.current = 0
  }, [])

  const setElapsedDirect = useCallback((s: number) => {
    baseElapsedRef.current = s
    startTimeRef.current = Date.now()
    setElapsed(s)
  }, [])

  return { elapsed, running, start, pause, reset, setElapsed: setElapsedDirect }
}
