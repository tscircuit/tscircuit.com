const INVALID_SESSION_ERROR_CODES = new Set([
  "no_token",
  "invalid_token",
  "session_not_found",
  "session_expired",
])

const EXPIRED_SESSION_ERROR_CODES = new Set([
  "session_not_found",
  "session_expired",
])

export const getAuthenticationErrorCopy = (errorCode?: string) => {
  const isExpiredSession =
    errorCode !== undefined && EXPIRED_SESSION_ERROR_CODES.has(errorCode)

  return {
    shouldClearSession:
      errorCode !== undefined && INVALID_SESSION_ERROR_CODES.has(errorCode),
    title: isExpiredSession ? "Session Expired" : "Sign In Required",
    description: isExpiredSession
      ? "Your session has expired. Click here to sign in again."
      : "Please sign in again to continue.",
  }
}
