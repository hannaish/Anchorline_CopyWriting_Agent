import { useEffect, useState } from 'react'

/** Counts down from `seconds` to 0, starting immediately on mount. Used for friction delays. */
export function useCountdown(seconds: number): { secondsLeft: number; done: boolean } {
  const [secondsLeft, setSecondsLeft] = useState(seconds)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  return { secondsLeft, done: secondsLeft <= 0 }
}
