import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`AI Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5177/ai")

    // it is only working for desktop beacuse fake testuser login is not appearing for mobile

    // await page.goto("http://127.0.0.1:5177");
    // await page.click("text='Fake testuser Login'");
    // await page.waitForSelector(".login-avatar");
    // await page.click(".header-button[href='/ai']");
    // await page.waitForSelector("text='Submit a prompt to get started!'");

    await expect(page).toHaveScreenshot(`AI-Page-${size}.png`)
  })
}
