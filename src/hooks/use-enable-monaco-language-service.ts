import { useEffect, useState } from "react"

const DESKTOP_MIN_WIDTH = 768

/**
 * Whether Monaco's memory-heavy TypeScript language service (the `ts.worker`
 * that loads the TypeScript compiler plus automatic type acquisition) should
 * run.
 *
 * Returns `false` on the first render and on any mobile-width viewport. Mobile
 * Safari has a hard per-tab memory cap and OOMs once the TS worker loads the
 * compiler and acquired `@types`, so we must never let it start there. Because
 * the viewport width is unknown until the client mounts, the flag starts
 * `false` (memory-safe) and only flips to `true` once a desktop-width viewport
 * is confirmed — a `useIsMobile`-style `false`-until-effect default would
 * briefly report desktop and spin the worker up before it could be corrected.
 */
export function useEnableMonacoLanguageService(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
    const update = () => setEnabled(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  return enabled
}
