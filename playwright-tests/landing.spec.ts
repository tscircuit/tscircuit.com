import { test, expect } from "@playwright/test"

test("landing page", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177")
  await expect(page).toHaveScreenshot()
})
