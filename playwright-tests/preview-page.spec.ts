import { expect, test } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`preview-snippet Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5173/preview?snippet_id=snippet_3")

    await page.waitForSelector(".run-button")
    await expect(page).toHaveScreenshot(`preview-snippet-before-${size}.png`)
    await page.click(".run-button")
    await page.waitForTimeout(1000)
    await expect(page).toHaveScreenshot(`preview-snippet-after-${size}.png`)
  })
}
