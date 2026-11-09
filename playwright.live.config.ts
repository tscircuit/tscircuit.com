import { defineConfig } from "@playwright/test"

// Runs against a real deployment and its real registry. No fake server or routes.
export default defineConfig({
  testDir: "playwright-tests",
  testMatch: /.*\.live\.spec\.ts/,
  workers: 1,
  retries: 0,
  timeout: 240_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: process.env.TSCIRCUIT_LIVE_URL,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
})
