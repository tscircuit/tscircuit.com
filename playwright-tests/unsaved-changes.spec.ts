import { test, expect } from "@playwright/test"

test("unsaved changes test", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?template=blank-circuit-board")

  // Click on the fake test user login button
  const loginButton = page
    .getByRole("button", { name: "fake testuser login" })
    .first()
  await loginButton.click()

  // Wait for the page to load after login
  await page.waitForTimeout(1000)

  // Verify that the "Save" button is clickable
  const saveButton = page.getByRole("button", { name: "Save" }).first()
  await expect(saveButton).toBeEnabled()

  // Click the "Save" button
  await saveButton.click()

  // Wait for the save operation to complete
  await page.waitForTimeout(1000)

  // Click the "Save" button again
  await saveButton.click()

  // Locate the content div and click on it
  const cmContentDiv = page.locator(".cm-content").first()
  await cmContentDiv.click()

  // Add a white space
  await page.keyboard.press("End")
  await page.keyboard.type(" ")

  // Wait for the changes
  await page.waitForTimeout(1000)

  // Verify that the "unsaved changes" message is visible
  const unsavedChanges = page.locator('text="unsaved changes"')
  await expect(unsavedChanges).toBeVisible()

  // Click the "Run" button to execute the changes
  const runButton = page.getByRole("button", { name: "Run" }).first()
  await runButton.click()

  // Click the "Save" button to save the changes
  await saveButton.click()

  // Wait for the save operation to complete
  await page.waitForTimeout(1000)

  // Verify that the "unsaved changes" message is no longer visible
  await expect(unsavedChanges).toBeHidden()

  await expect(page).toHaveScreenshot(
    "unsaved-changes.spec.ts-unsaved-changes-test.png",
  )
})
