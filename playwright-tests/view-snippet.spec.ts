import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test.skip(`view-snippet Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5177/testuser/my-test-board")

    await page.waitForSelector(".run-button")
    await expect(page).toHaveScreenshot(`view-snippet-before-${size}.png`)
    await page.click(".run-button")
    await page.waitForTimeout(5000)
    await expect(page).toHaveScreenshot(`view-snippet-after-${size}.png`)

    if (size !== "xs") {
      await page.click('span:has-text("Files")')
    }
  })
}

test("files dialog", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")

  await page.waitForSelector(".run-button")

  await page.click('span:has-text("Files")')
  await expect(page).toHaveScreenshot(`view-snippet-files.png`)
})
