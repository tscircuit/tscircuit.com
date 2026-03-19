import { test, expect } from "@playwright/test"

test("Editor loads snippet correctly", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_5")

  // Wait for network requests to complete
  // await page.waitForLoadState("networkidle")

  // Check for specific text that should be present
  await expect(page.getByText("A555Timer").first()).toBeVisible()

  // Take a snapshot
  await expect(page).toHaveScreenshot("editor-with-snippet.png")
})

test("Circuit JSON search keeps focus while typing", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("runframe-active-tab", "circuit_json")
  })

  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_5")

  await expect(page.getByText("A555Timer").first()).toBeVisible()

  const circuitJsonSearch = page.locator('table input[type="text"]').first()
  await expect(circuitJsonSearch).toBeVisible()

  await circuitJsonSearch.click()
  await circuitJsonSearch.type("res")

  await expect(circuitJsonSearch).toBeFocused()
  await expect(circuitJsonSearch).toHaveValue("res")
})
