import { defineConfig } from "@playwright/test"

export default defineConfig({
  // Run your local dev server before starting the tests
  webServer: {
    command: "npm run start:playwright-server",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 5000,
  },
  testDir: "playwright-tests",
  snapshotPathTemplate: "playwright-tests/snapshots/{testFilePath}-{arg}{ext}",
  testMatch: /.*\.spec\.ts/,
})
