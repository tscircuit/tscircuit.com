import { test, expect } from "@playwright/test"

test("/ai", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177")
  await page.click("text='Fake testuser Login'")
  await page.waitForSelector(".login-avatar")
  await page.click(".header-button[href='/ai']")
  await page.waitForSelector("text='Submit a prompt to get started!'")
  await expect(page).toHaveScreenshot()
})
