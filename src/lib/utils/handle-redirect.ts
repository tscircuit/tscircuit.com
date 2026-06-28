export const getSafeRedirectTarget = (
  redirect: string | null,
): string | null => {
  if (!redirect) {
    return null
  }

  try {
    const decodedRedirect = decodeURIComponent(redirect)

    if (decodedRedirect.startsWith("/")) {
      return decodedRedirect
    }

    const redirectUrl = new URL(decodedRedirect)
    if (redirectUrl.origin === window.location.origin) {
      return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
    }
  } catch (e) {
    console.warn("Invalid redirect URL:", redirect)
  }

  return null
}

const normalizeAppLocation = (location?: string) => {
  if (!location) return "/"
  return location.startsWith("/") ? location : `/${location}`
}

export const getCurrentAppPath = (location?: string) => {
  const fallbackLocation = normalizeAppLocation(location)

  if (typeof window === "undefined") return fallbackLocation

  return (
    `${window.location.pathname}${window.location.search}${window.location.hash}` ||
    fallbackLocation
  )
}

export const getLoginPath = (location?: string) =>
  `/login?redirect=${encodeURIComponent(getCurrentAppPath(location))}`

export const handleRedirect = (
  redirect: string | null,
  fallback: () => void,
) => {
  const safeTarget = getSafeRedirectTarget(redirect)
  if (safeTarget) {
    window.location.href = safeTarget
    return
  }
  fallback()
}
