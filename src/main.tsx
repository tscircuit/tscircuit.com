import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./lib/sentry"
import "./index.css"

if (typeof window !== "undefined" && !window.__APP_LOADED_AT) {
  window.__APP_LOADED_AT = Date.now()
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
