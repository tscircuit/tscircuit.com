import { test, expect } from "@playwright/test"

test("Search links open correctly", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/dashboard")

  await page.getByPlaceholder("Search").click()
  await page.getByPlaceholder("Search").fill("sev")
  await page.getByRole("link", { name: "seveibar/a555timer A simple" }).click()

  await page.waitForTimeout(500)

  // Check for specific text that should be present
  await expect(page).toHaveScreenshot("search-links.png")

  await page.getByPlaceholder("Search").click()
  await page.getByPlaceholder("Search").fill("my")

  const popupPromise = page.waitForEvent("popup")
  await page.getByRole("link", { name: "testuser/my-test-board A" }).click()

  const popup = await popupPromise

  await popup.waitForLoadState("networkidle")

  const popupUrl = popup.url()
  expect(popupUrl).toMatch("http://127.0.0.1:5177/editor?snippet_id=snippet_3")
})
