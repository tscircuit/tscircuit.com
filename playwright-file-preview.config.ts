import { defineConfig } from "@playwright/test"
import baseConfig from "./playwright.config"

export default defineConfig({
  ...baseConfig,
  testMatch: "large-package-file.spec.ts",
  workers: 1,
  timeout: 60000,
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // The workflow builds the test API before starting the browser tests.
  webServer: {
    command: "bun x vite --host 127.0.0.1 --port 5177",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
