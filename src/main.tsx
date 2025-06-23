import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"

if (typeof window !== "undefined" && !window.__APP_LOADED_AT) {
  window.__APP_LOADED_AT = Date.now()
}
import "./index.css"
import { setupBuildWatcher } from "./build-watcher"

setupBuildWatcher()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
