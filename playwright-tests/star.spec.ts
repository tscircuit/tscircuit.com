import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
  await page.getByRole("button", { name: "Log in" }).click()
})

test("test for starring a repo", async ({ page }) => {
  // Check for initial page content
  await expect(page.getByText("testuser/my-test-boardBOARD")).toBeVisible()
  const starButton = page.getByRole("button", { name: "Star" })
  await expect(starButton).toBeVisible()

  // Add starr
  await starButton.click()
  await page.waitForTimeout(2000) // Allow time for the action to complete

  // Verify star action
  await expect(page.locator("ol")).toBeVisible()
  // await page.getByText('You\'ve starred this snippet').click();

  // Take a screenshot
  await expect(page).toHaveScreenshot("star-button.png")
})

test("test for removing a star from a repo", async ({ page }) => {
  // Ensure repo is starred before test
  const starredButton = page.getByRole("button", { name: "Starred" })
  await expect(starredButton).toBeVisible()

  // Remove star
  await starredButton.click()

  // Verify destar action
  const starButton = page.getByRole("button", { name: "Star" })
  await expect(starButton).toBeVisible()

  // Take a screenshot
  await expect(page).toHaveScreenshot("remove-star-button.png")
})
