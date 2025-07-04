// files-dialog.spec.js
import { expect, test } from "@playwright/test"

test("files dialog", async ({ page }) => {
  // Wait for network requests during navigation
  await Promise.all([page.goto("http://127.0.0.1:5177/testuser/my-test-board")])

  // Wait for run button and files tab to be visible
  await page.waitForSelector(".run-button", { state: "visible" })
  const filesTab = await page.waitForSelector('span:has-text("Files")', {
    state: "visible",
  })

  // Click and wait for any animations or state changes
  await filesTab.click()
  await page.getByLabel("Files").click()

  await expect(page).toHaveScreenshot(`view-snippet-files.png`)
})
