import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./lib/sentry"
import "./index.css"

if (typeof window !== "undefined" && !window.__APP_LOADED_AT) {
  window.__APP_LOADED_AT = Date.now()
}

function AppWrapper() {
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
