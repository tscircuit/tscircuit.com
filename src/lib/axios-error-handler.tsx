import type { Store } from "@/hooks/use-global-store"
import { decodeJwt } from "jose"
import { toast } from "@/hooks/use-toast"

let has401ToastBeenShown = false
let toastResetTimer: NodeJS.Timeout | null = null

/**
 * Validates if a JWT session token is still valid (not expired)
 * Returns true if valid, false if invalid or expired
 */
export const isSessionValid = (session: Store["session"]): boolean => {
  if (!session?.token) return false

  try {
    // decodeJwt does not verify the signature, just decodes the payload
    const payload = decodeJwt(session.token)

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false
    }

    return true
  } catch (error) {
    // If we can't decode the token at all, it's invalid
    console.error("Failed to decode JWT:", error)
    return false
  }
}

interface AxiosErrorHandlerOptions {
  session: Store["session"]
  setSession: (session: Store["session"]) => void
  signIn: () => void
}

/**
 * Creates an error handler for axios requests that handles 401 errors
 * by validating the session and showing appropriate toasts
 */
export const createAxiosErrorHandler = ({
  session,
  setSession,
  signIn,
}: AxiosErrorHandlerOptions) => {
  return (error: any) => {
    const status = error?.response?.status ?? error?.status

    if (status === 401 && session?.token) {
      // Always clear the session on 401 (server rejected the token)
      setSession(null)

      // Only show toast once to avoid spam
      if (!has401ToastBeenShown) {
        has401ToastBeenShown = true

        // Clear any existing timer to prevent race conditions
        if (toastResetTimer) {
          clearTimeout(toastResetTimer)
        }

        // Determine if it's expired or invalid by checking JWT
        let reason = "Your session has expired"
        const isValid = isSessionValid(session)
        if (isValid) {
          // Token is valid locally but server rejected it
          reason = "Your session was invalidated"
        } else {
          // Token is expired locally
          reason = "Your session has expired"
        }

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
        toastResetTimer = setTimeout(() => {
          has401ToastBeenShown = false
          toastResetTimer = null
        }, 6000)
      }
    }

    throw error
  }
}
