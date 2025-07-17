import { expect, test } from "@playwright/test"
import { viewports } from "../viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test.describe(`FootprintDialog tests - ${size} viewport`, () => {
    let isMobileOrTablet: boolean

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto("http://127.0.0.1:5177/editor")
      await expect(page.getByRole("button", { name: "Run" })).toBeVisible()
      isMobileOrTablet = page.viewportSize()?.width! <= 768
    })

    test("opens footprint dialog and shows preview", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
        await page.waitForSelector('button:has-text("Show Preview")')
      }
      await page.click('button:has-text("Insert")')
      await page.click("text=Chip")
      await expect(page.getByRole("dialog")).toBeVisible()
      await expect(page.getByRole("heading", { name: "Insert" })).toBeVisible()
      await expect(page).toHaveScreenshot(`footprint-preview-${size}.png`)
    })
  })
}
