import type { Store } from "@/hooks/use-global-store"
import { decodeJwt } from "jose"

/**
 * Checks if a JWT session token has expired based on its exp claim
 * Returns true if expired, false if not expired or no expiration set
 */
export const isSessionExpired = (session: Store["session"]): boolean => {
  if (!session?.token) return false

  try {
    // decodeJwt does not verify the signature, just decodes the payload
    const payload = decodeJwt(session.token)

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true // Expired
    }

    return false // Not expired
  } catch (error) {
    // If we can't decode the token, don't assume it's expired
    console.error("Failed to decode JWT:", error)
    return false
  }
}

