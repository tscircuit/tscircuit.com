import type { ToasterToast } from "@/hooks/use-toast"
import { isTscircuitSessionJwtExpired } from "@/lib/auth/session"
import { getEasyEdaProxyAuthErrorCode } from "@/lib/get-easyeda-proxy-auth-error-code"

type GetEasyEdaProxyAuthToastParams = {
  circuitJson: unknown
  sessionToken?: string
}

export const getEasyEdaProxyAuthToast = ({
  circuitJson,
  sessionToken,
}: GetEasyEdaProxyAuthToastParams): ToasterToast | null => {
  const proxyAuthErrorCode = getEasyEdaProxyAuthErrorCode(circuitJson)
  if (!proxyAuthErrorCode) return null

  const toastOptions = {
    id: "auth-401",
    variant: "destructive" as const,
    duration: 10_000,
  }

  const isExpiredSession =
    proxyAuthErrorCode === "session_expired" ||
    (proxyAuthErrorCode === "invalid_token" &&
      sessionToken !== undefined &&
      isTscircuitSessionJwtExpired(sessionToken))

  if (isExpiredSession) {
    return {
      ...toastOptions,
      title: "Session Expired",
      description:
        "Your session has expired. Please sign out and sign in again.",
    }
  }

  if (proxyAuthErrorCode === "no_token" && !sessionToken) {
    return {
      ...toastOptions,
      title: "Sign In Required",
      description: "Please sign in to fetch component data.",
    }
  }

  return {
    ...toastOptions,
    title: "Authentication Failed",
    description:
      "We couldn't authenticate your session. Please sign out and sign in again.",
  }
}
