import { test, expect } from "@playwright/test"
import { viewports } from "../viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test.describe(`Footprint Insertion tests - ${size} viewport`, () => {
    let isMobileOrTablet: boolean

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto("http://127.0.0.1:5177/editor")
      // await page.waitForLoadState("networkidle")
      await expect(page.getByRole("button", { name: "Run" })).toBeVisible()
      isMobileOrTablet = page.viewportSize()?.width! <= 768
    })

    test("inserts footprint into code", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }
      await page.click('button:has-text("Insert")')
      await page.click("text=Chip")
      await page.fill(
        'input[placeholder="Enter chip name (e.g., U1)..."]',
        "U1",
      )
      await page.getByRole("combobox").click()
      await page.getByRole("option", { name: "ms012" }).click()
      await page.click('button:has-text("Insert Footprint")')
      await page.waitForSelector('[role="dialog"]', {
        state: "hidden",
        timeout: 5000,
      })
      await expect(page.locator(".cm-content")).toContainText("<chip")
      await expect(page.locator(".cm-content")).toContainText('name="U1"')
      await expect(page).toHaveScreenshot(`footprint-insertion-${size}.png`)
    })
  })
}
