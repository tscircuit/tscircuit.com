import { useCallback, useEffect, useRef } from "react"
import { useGlobalStore } from "./use-global-store"
import { toast } from "./use-toast"
import { isSessionExpired } from "@/utils/is-session-expired"

/**
 * Hook that provides a 401 error handler for axios requests
 * Handles session clearing and user notifications
 */
export const useAxios401Handler = () => {
  const session = useGlobalStore((s) => s.session)
  const setSession = useGlobalStore((s) => s.setSession)

  const has401ToastBeenShownRef = useRef(false)
  const toastResetTimerRef = useRef<number | null>(null)
  const signInPromptTimerRef = useRef<number | null>(null)

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (toastResetTimerRef.current) {
        clearTimeout(toastResetTimerRef.current)
      }
      if (signInPromptTimerRef.current) {
        clearTimeout(signInPromptTimerRef.current)
      }
    }
  }, [])

  const handle401Error = useCallback(() => {
    if (!session?.token) return

    // ONLY clear the session if the JWT token has expired
    // Don't clear on normal 401s (user accessing unauthorized resources)
    const sessionExpired = isSessionExpired(session)
    if (!sessionExpired) {
      // Session is not expired, this is just an authorization issue
      // Don't clear the session or show toast
      return
    }

    // Session has expired, clear it
    setSession(null)

    // Only show toast once to avoid spam
    if (!has401ToastBeenShownRef.current) {
      has401ToastBeenShownRef.current = true

      // Clear any existing timer to prevent race conditions
      if (toastResetTimerRef.current) {
        clearTimeout(toastResetTimerRef.current)
      }

      // Show sign-out notification
      toast({
        title: "Signed Out",
        description: "Your session has expired",
        variant: "destructive",
        duration: 3000,
      })

      // Show sign-in prompt after a short delay
      signInPromptTimerRef.current = window.setTimeout(() => {
        toast({
          title: "Sign In Required",
          description: "Click here to sign in again",
          variant: "default",
          duration: 5000,
        })
        signInPromptTimerRef.current = null
      }, 500)

      // Reset the flag after a delay so future 401s can show toast again
      toastResetTimerRef.current = window.setTimeout(() => {
        has401ToastBeenShownRef.current = false
        toastResetTimerRef.current = null
      }, 6000)
    }
  }, [session])

  return handle401Error
}
