import { test, expect } from "@playwright/test"

test("test for starring a repo", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
  await page.getByRole("button", { name: "Fake testuser Login" }).click()

  await page.waitForLoadState("networkidle")

  // Check for initial page content
  await expect(page.getByText("testuser/my-test-boardBOARD")).toBeVisible()
  const starButton = page.getByRole("button", { name: "Star" })
  await expect(starButton).toBeVisible()

  // add star and wait for API response
  const addStarPromise = page.waitForResponse((resp) =>
    resp.url().includes("/api/snippets/add_star"),
  )
  await starButton.click()
  await addStarPromise

  // Wait for button text to change to "Starred"
  const starredButton = page.getByRole("button", { name: "Starred" })
  await expect(starredButton).toBeVisible({ timeout: 10000 })

  // Wait for any animations or transitions to complete
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  await expect(page).toHaveScreenshot("star-button.png", {
    timeout: 10000,
    animations: "disabled",
  })
})

test("test for removing a star from a repo", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
  await page.getByRole("button", { name: "Fake testuser Login" }).click()

  await page.waitForLoadState("networkidle")

  // Check for initial page content
  await expect(page.getByText("testuser/my-test-boardBOARD")).toBeVisible()
  const starButton = page.getByRole("button", { name: "Star" })
  await expect(starButton).toBeVisible()

  // First star the repo and wait for API response
  const addStarPromise = page.waitForResponse((resp) =>
    resp.url().includes("/api/snippets/add_star"),
  )
  await starButton.click()
  await addStarPromise

  // Wait for button text to change to "Starred"
  const starredButton = page.getByRole("button", { name: "Starred" })
  await expect(starredButton).toBeVisible({ timeout: 10000 })

  // Remove star and wait for API response
  const removeStarPromise = page.waitForResponse((resp) =>
    resp.url().includes("/api/snippets/remove_star"),
  )
  await starredButton.click()
  await removeStarPromise

  // Wait for button text to change back to "Star"
  const unstarredButton = page.getByRole("button", { name: "Star" })
  await expect(unstarredButton).toBeVisible({ timeout: 10000 })

  // Wait for any animations or transitions to complete
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  await expect(page).toHaveScreenshot("remove-star-button.png", {
    timeout: 10000,
    animations: "disabled",
  })
})
