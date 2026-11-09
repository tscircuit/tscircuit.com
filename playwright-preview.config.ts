import { defineConfig } from "@playwright/test"
import base from "./playwright.config"

export default defineConfig({
  ...base,
  testMatch: "datasheet-reference-designs.preview.ts",
  webServer: {
    command: "REFERENCE_DESIGN_PREVIEW=true bunx vite --port 5179",
    url: "http://127.0.0.1:5179",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
