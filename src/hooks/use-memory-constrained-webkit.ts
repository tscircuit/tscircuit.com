import { useState } from "react"

/**
 * Chrome / Firefox / Edge on iOS all use WKWebView but get a lower per-tab
 * memory watermark than Safari. Monaco + RunFrame together reliably OOM those
 * browsers ("Can't open this page").
 */
export function isMemoryConstrainedWebKit(): boolean {
  if (typeof navigator === "undefined") return false

  const ua = navigator.userAgent
  const isIOS =
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  if (!isIOS) return false

  // Safari's UA contains "Safari" and not these other browser tokens.
  const isSafari =
    /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua)

  return !isSafari
}

export function useMemoryConstrainedWebKit() {
  const [constrained] = useState(isMemoryConstrainedWebKit)
  return constrained
}
