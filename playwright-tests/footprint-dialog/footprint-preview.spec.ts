import { expect, test } from "@playwright/test"
import { viewports } from "../viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test.describe(`Footprint Preview tests - ${size} viewport`, () => {
    let isMobileOrTablet: boolean

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto("http://127.0.0.1:5177/editor")
      await expect(page.getByRole("button", { name: "Run" })).toBeVisible()
      isMobileOrTablet = page.viewportSize()?.width! <= 768
    })

    test("parameter controls update preview", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }
      await page.click('button:has-text("Insert")')
      await page.click("text=Chip")
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.getByRole("combobox").click()
      await page.getByRole("option", { name: "dip" }).click()
      await page.fill('label:has-text("Number of Pins") + input', "16")
      const previewContainer = page.locator(".rounded-xl.overflow-hidden svg")
      const initialPreview = await previewContainer.innerHTML()
      await page.fill('label:has-text("Number of Pins") + input', "22")
      await page.waitForTimeout(500)
      const updatedPreview = await previewContainer.innerHTML()
      expect(initialPreview).not.toEqual(updatedPreview)
      await expect(page).toHaveScreenshot(`footprint-preview-${size}.png`)
    })
  })
}
