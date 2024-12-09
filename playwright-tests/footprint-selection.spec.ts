import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test.describe(`Footprint Selection tests - ${size} viewport`, () => {
    let isMobileOrTablet: boolean

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto("http://127.0.0.1:5177/editor")
      await page.waitForSelector("button.run-button")
      isMobileOrTablet = page.viewportSize()?.width! <= 768
    })

    test("footprint selection and preview updates", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }
      await page.click('button:has-text("Insert")')
      await page.click("text=Footprint")
      await page.getByRole("combobox").click()
      await page.getByRole("option", { name: "ms012" }).click()
      await expect(
        page.locator(".rounded-xl.overflow-hidden svg"),
      ).toBeVisible()
      await expect(page).toHaveScreenshot(`footprint-preview-${size}.png`)
    })
  })
}
