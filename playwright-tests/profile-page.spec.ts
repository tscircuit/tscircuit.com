import { test, expect } from "@playwright/test"

test.skip("test delete functionality in profile", async ({ page }) => {
  // Go to profile page
  await page.goto("http://localhost:5177/testuser")

  // Login
  await page.getByRole("button", { name: "Log in" }).click()

  // Wait for snippets grid to load
  await page.waitForSelector(".grid")
  await page.waitForLoadState("networkidle")

  // Verify initial snippet exists
  const snippetTitle = page.locator(".text-md.font-semibold").first()
  const snippetName = await snippetTitle.textContent()
  expect(await snippetTitle.isVisible()).toBe(true)

  // Take screenshot of initial state
  await expect(page).toHaveScreenshot("profile-page-before-delete.png")

  // Open dropdown menu
  await page.locator(".lucide-ellipsis-vertical").first().click()
  await page.waitForTimeout(1000)

  // Take screenshot with dropdown open
  await expect(page).toHaveScreenshot("profile-page-dropdown-open.png")

  // Click delete option
  await page.getByRole("menuitem", { name: "Delete Snippet" }).click()

  // Wait for and verify confirmation dialog
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  const dialogText = await dialog.textContent()
  expect(dialogText).toContain(
    `Are you sure you want to delete the snippet "${snippetName}"?`,
  )

  // Take screenshot of delete dialog
  await expect(page).toHaveScreenshot("profile-page-delete-dialog.png")

  // Confirm delete
  await page.getByRole("button", { name: "Delete" }).click()

  // Verify success toast appears
  await page.waitForSelector('div:has-text("Successfully deleted")', {
    state: "visible",
  })

  // Wait for page to update
  await page.waitForLoadState("networkidle")

  // Verify snippet is removed
  const remainingSnippets = await page
    .locator(`.text-md.font-semibold:has-text("${snippetName}")`)
    .count()
  expect(remainingSnippets).toBe(0)
})

test("test starring a snippet and verifying in Starred Snippets tab", async ({
  page,
}) => {
  // Go to profile page
  await page.goto("http://localhost:5177/testuser")

  // Login
  await page.getByRole("button", { name: "Log in" }).click()

  // Wait for page to load
  await page.waitForLoadState("networkidle")

  // Open the first snippet
  const snippetLink = page.locator(".text-md.font-semibold").first()
  const snippetName = await snippetLink.textContent()
  await snippetLink.click()

  // Wait for snippet page to load
  await page.waitForLoadState("networkidle")

  const starButton = page.getByRole("button", { name: "Star" })
  await expect(starButton).toBeVisible()
  await starButton.click()
  await expect(page.locator(".text-yellow-500")).toBeVisible()
  await expect(page).toHaveScreenshot("snippet-page-open-after-star-click.png")

  // Navigate back to the profile page
  await page.goto("http://localhost:5177/testuser")

  // Wait for page to load and take screenshot
  await page.waitForLoadState("networkidle")
  await expect(page).toHaveScreenshot("profile-page-snippets-tab.png")

  const starredTab = page.getByRole("tab", { name: "Starred Snippets" })
  await expect(starredTab).toBeVisible()
  await starredTab.click()
  await page.waitForLoadState("networkidle")
  await expect(page.locator(".grid")).toBeVisible()
  await expect(page).toHaveScreenshot("profile-page-starred-tab.png")

  const starredSnippet = page
    .locator(".grid")
    .locator(`.text-md.font-semibold:has-text("${snippetName}")`)
  await expect(starredSnippet).toBeVisible()
})
