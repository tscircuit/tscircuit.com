import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

export const Analytics = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <VercelAnalytics />
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
