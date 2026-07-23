import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./lib/sentry"
import "./lib/monaco-workers"
import "./index.css"
import "@tscircuit/order-dialog/styles.css"
import "@tscircuit/monaco-code-editor/styles.css"
import { useSessionExpiryLogout } from "./hooks/use-session-expiry-logout"

if (typeof window !== "undefined" && !window.__APP_LOADED_AT) {
  window.__APP_LOADED_AT = Date.now()
}

function AppWrapper() {
  useSessionExpiryLogout()

  useEffect(() => {
    if (typeof window !== "undefined" && window.__hideLoader) {
      window.__hideLoader()
    }
  }, [])

  return <App />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
