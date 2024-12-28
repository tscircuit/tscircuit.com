import { defineConfig } from "@playwright/test"

export default defineConfig({
  // Run your local dev server before starting the tests
  retries: process.env.CI ? 2 : 1,
  webServer: {
    command: "npm run start:playwright-server",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 10000,
  },
  testDir: "playwright-tests",
  snapshotPathTemplate: "playwright-tests/snapshots/{testFilePath}-{arg}{ext}",
  testMatch: /.*\.spec\.ts/,
  expect: {
    toHaveScreenshot: {
      // Increase the maximum allowed difference in pixels
      maxDiffPixelRatio: 0.2,
      // Increase the threshold for considering pixels different
      threshold: 0.2,
      animations: "disabled",
    },
  },
  use: {
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },
})
