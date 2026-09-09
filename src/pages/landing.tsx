import { useEffect } from "react"

// The landing page is owned by tscircuit/tscircuit.com-landing and served at
// tscircuit.com by Vercel. This also handles client-side redirects to home and
// local development, where the landing-page rewrite is not available.
export function LandingPage() {
  useEffect(() => {
    window.location.replace(
      `https://tscircuit.com/${window.location.search}${window.location.hash}`,
    )
  }, [])

  return <a href="https://tscircuit.com/">Continue to tscircuit</a>
}
