import { useCallback, useRef } from "react"
import { useGlobalStore } from "./use-global-store"
import { useSignIn } from "./use-sign-in"
import { toast } from "./use-toast"
import { getSessionInvalidReason } from "@/lib/axios-error-handler"

/**
 * Hook that provides a 401 error handler for axios requests
 * Handles session clearing and user notifications
 */
export const useAxios401Handler = () => {
  const session = useGlobalStore((s) => s.session)
  const setSession = useGlobalStore((s) => s.setSession)
  const signIn = useSignIn()

  const has401ToastBeenShownRef = useRef(false)
  const toastResetTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handle401Error = useCallback(() => {
    if (!session?.token) return

    // Always clear the session on 401 (server rejected the token)
    setSession(null)

    // Only show toast once to avoid spam
    if (!has401ToastBeenShownRef.current) {
      has401ToastBeenShownRef.current = true

      // Clear any existing timer to prevent race conditions
      if (toastResetTimerRef.current) {
        clearTimeout(toastResetTimerRef.current)
      }

      const reason = getSessionInvalidReason(session)

      // Show sign-out notification
      toast({
        title: "Signed Out",
        description: reason,
        variant: "destructive",
        duration: 3000,
      })

      // Show sign-in prompt after a short delay
      setTimeout(() => {
        toast({
          title: "Sign In Required",
          description: "Click here to sign in again",
          variant: "default",
          duration: 5000,
        })
      }, 500)

      // Reset the flag after a delay so future 401s can show toast again
      toastResetTimerRef.current = setTimeout(() => {
        has401ToastBeenShownRef.current = false
        toastResetTimerRef.current = null
      }, 6000)
    }
  }, [session, setSession, signIn])

  return handle401Error
}
