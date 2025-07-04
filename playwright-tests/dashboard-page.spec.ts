import { expect, test } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`Dashboard Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5177/dashboard")
    await expect(page).toHaveScreenshot(`Dashboard-page-${size}.png`)
  })
}
