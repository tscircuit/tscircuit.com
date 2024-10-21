import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`view-snippet Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5177/testuser/my-test-board")

    await page.waitForSelector(".run-button")
    await expect(page).toHaveScreenshot(`view-snippet-before-${size}.png`)
    await page.click(".run-button")
    await page.waitForTimeout(5000)
    await expect(page).toHaveScreenshot(`view-snippet-after-${size}.png`)
  })
}
