import { useEffect, useRef, useState } from "react"

const prefersReducedMotion = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Recompute as an event. When a weight moves, the overall score steps through
 * the values between rather than swapping, so causation is watched rather than
 * inferred. Under reduced motion the target is returned during render, so no
 * state is set and no extra render is triggered.
 */
export function useSteppedNumber(target: number, stepMs = 45) {
  const [reduced] = useState(prefersReducedMotion)
  const [shown, setShown] = useState(target)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) return

    const tick = () => {
      setShown((current) => {
        const delta = Math.round((target - current) * 10) / 10
        if (Math.abs(delta) < 0.05) {
          if (timer.current) window.clearInterval(timer.current)
          timer.current = null
          return target
        }
        return Math.round((current + Math.sign(delta) * 0.1) * 10) / 10
      })
    }

    timer.current = window.setInterval(tick, stepMs)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
      timer.current = null
    }
  }, [target, stepMs, reduced])

  return reduced ? target : shown
}
