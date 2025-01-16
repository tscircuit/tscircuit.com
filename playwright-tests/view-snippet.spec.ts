import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`view-snippet Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)

    // Wait for network requests during navigation
    await Promise.all([
      // page.waitForLoadState("networkidle"),
      page.goto("http://127.0.0.1:5177/testuser/my-test-board"),
    ])

    // Wait for run button to be visible and clickable
    const runButton = await page.waitForSelector(".run-button", {
      state: "visible",
    })
    await expect(page).toHaveScreenshot(`view-snippet-before-${size}.png`)

    // Click and wait for any network requests or animations to complete
    await Promise.all([runButton.click()])

    // Wait for PCB tab to be fully loaded and any animations to complete
    await page.waitForTimeout(1000) // Reduced timeout, just for animations
    await expect(page).toHaveScreenshot(`view-snippet-after-${size}.png`)

    if (size !== "xs") {
      // Wait for Files tab to be visible and clickable
      const filesTab = await page.waitForSelector('span:has-text("Files")', {
        state: "visible",
      })
      await filesTab.click()
    }
  })
}
