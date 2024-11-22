import { test, expect } from "@playwright/test"

test("Manual edits test", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_4")

  // Wait for network requests to complete
  await page.waitForLoadState("networkidle")

  await page.getByRole("button", { name: "Fake testuser Login" }).click()
  await page.waitForTimeout(500)

  await page.getByRole("combobox").click()
  await page.getByText("manual-edits.json").click()
  await expect(page).toHaveScreenshot("editor-manual-edits.png")
})

test("Manual edits test view", async ({ page }) => {
  await page.goto("http://localhost:5177/seveibar/a555timer")

  await page.waitForLoadState("networkidle")

  await page.goto("http://localhost:5177/seveibar/a555timer")
  await page.getByRole("link", { name: "Files" }).click()
  await page.getByText("manual-edits.json").click()
  await expect(page).toHaveScreenshot("manual-edits-view.png")
})
