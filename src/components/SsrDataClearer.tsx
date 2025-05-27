import { useEffect, useRef } from "react"
import { useLocation } from "wouter"

/**
 * This component listens for route changes and clears any properties
 * on the window object that start with "SSR_" to prevent stale
 * server-side rendered data from being used on subsequent client-side navigations.
 */
export const SsrDataClearer = () => {
  const [location] = useLocation()
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    for (const key in window) {
      if (key.startsWith("SSR_")) {
        try {
          delete window[key]
        } catch (e) {
          console.error(`Failed to clear window.${key}`, e)
        }
      }
    }
  }, [location])

  return null
}
