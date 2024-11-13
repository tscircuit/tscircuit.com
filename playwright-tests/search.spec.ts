import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`search test for ${size} viewport`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5173/")

    const searchInput = page.getByRole("searchbox", { name: "Search" }).first()

    if (size !== "lg") {
      const menuButton = page.locator("button.md\\:hidden")
      await menuButton.click()
      await page.waitForTimeout(500)
    }

    await searchInput.fill("seve")

    // Wait for search response
    await page.waitForResponse(
      (response) =>
        response.url().includes("/search") && response.status() === 200,
    )

    await expect(page).toHaveScreenshot(`search-${size}.png`)
  })
}
