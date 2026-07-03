import { useEffect } from "react"
import { useGlobalStore } from "./use-global-store"

const MAX_TIMEOUT_MS = 2_147_483_647

const getJwtExpirationMs = (token: string) => {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    )
    const decodedPayload = JSON.parse(window.atob(paddedPayload))

    return typeof decodedPayload.exp === "number"
      ? decodedPayload.exp * 1000
      : null
  } catch {
    return null
  }
}

export const useSessionExpiryLogout = () => {
  const sessionToken = useGlobalStore((s) => s.session?.token)
  const setSession = useGlobalStore((s) => s.setSession)

  useEffect(() => {
    if (!sessionToken) return

    const expiresAt = getJwtExpirationMs(sessionToken)
    if (!expiresAt) return

    let timeoutId: number | undefined

    const scheduleLogout = () => {
      const msUntilExpiration = expiresAt - Date.now()

      if (msUntilExpiration <= 0) {
        setSession(null)
        return
      }

      timeoutId = window.setTimeout(
        scheduleLogout,
        Math.min(msUntilExpiration, MAX_TIMEOUT_MS),
      )
    }

    scheduleLogout()

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [sessionToken, setSession])
}
