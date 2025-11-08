import type { Store } from "@/hooks/use-global-store"
import { decodeJwt } from "jose"

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

/**
 * Determines the reason for session invalidity
 */
export const getSessionInvalidReason = (session: Store["session"]): string => {
  const isValid = isSessionValid(session)
  if (isValid) {
    return "Your session was invalidated"
  }
  return "Your session has expired"
}
