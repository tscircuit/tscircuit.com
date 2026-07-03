import { Analytics as VercelAnalytics } from "@vercel/analytics/react"
import React from "react"

/**
 * The Vercel Analytics script is a third-party dependency that can throw at
 * runtime (e.g. when a tracker-blocking browser like Brave leaves one of its
 * internal values undefined). Because it renders globally, an unhandled throw
 * there surfaces as an app-wide error. This boundary keeps analytics failures
 * contained and silent so they can never break the page or spam error tracking.
 */
class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Analytics is non-critical; swallow the failure and log for debugging.
    console.warn("Analytics failed to render", error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export const Analytics = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <AnalyticsErrorBoundary>
        <VercelAnalytics />
      </AnalyticsErrorBoundary>
      {/* <CookieConsent
        buttonText="Accept"
        cookieName="cookieConsent"
        style={{ background: "#2B373B" }}
        acceptOnScroll
        buttonStyle={{
          backgroundColor: "#111",
          color: "#fff",
          fontSize: "13px",
        }}
        expires={150}
      >
        This website uses cookies to enhance the user experience.
      </CookieConsent> */}
    </div>
  )
}
