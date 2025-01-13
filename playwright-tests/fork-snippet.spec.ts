import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/seveibar/push-button")
  await page.getByRole("button", { name: "Log in" }).click()
})

test("test for forking a snippet", async ({ page }) => {
  // Ensure the page is loaded and snippet title is visible

  // Ensure the Fork button is visible
  const forkButton = page.getByRole("button", { name: "Fork" })
  await expect(forkButton).toBeVisible()

  // Fork the snippet
  await forkButton.click()

  // Wait for any necessary UI updates or actions (adjust time if needed)
  await page.waitForTimeout(3500)

  // Verify that the page reflects the fork action (optional based on your page behavior)
  // Take a screenshot of the forked state
  await expect(page).toHaveScreenshot("fork-snippet-button.png")
})

test("test for handling already forked snippet", async ({ page }) => {
  // Ensure snippet is already forked before starting this test
  await page.goto("http://127.0.0.1:5177/seveibar/push-button")

  // Attempt to fork again
  const forkButton = page.getByRole("button", { name: "Fork" })
  await forkButton.click()
  await page.waitForTimeout(2000)
  // Take a screenshot of the error state
  await expect(page).toHaveScreenshot("already-forked-error.png")
})
