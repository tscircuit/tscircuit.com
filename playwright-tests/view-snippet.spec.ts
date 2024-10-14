import { test, expect } from "@playwright/test"

test("view snippet", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
  await page.waitForSelector(".run-button")
  await expect(page).toHaveScreenshot()
  await page.click(".run-button")
  await page.waitForTimeout(5000)
  await expect(page).toHaveScreenshot()
})
