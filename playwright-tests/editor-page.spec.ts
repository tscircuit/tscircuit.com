import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

test("Editor loads snippet correctly", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_5")

  // Wait for network requests to complete
  await page.waitForLoadState("networkidle")

  // Check for specific text that should be present
  await expect(page.getByText("A555Timer", { exact: true })).toBeVisible()

  // Take a snapshot
  await expect(page).toHaveScreenshot("editor-with-snippet.png")
})
