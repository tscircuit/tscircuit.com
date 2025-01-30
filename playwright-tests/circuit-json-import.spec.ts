import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/quickstart")
  const loginButton = page.getByRole("button", { name: "Log in" })

  if (await loginButton.isVisible()) {
    await loginButton.click()
  }

  await page.waitForLoadState("networkidle")
})

test("should open the Circuit Json Import Dialog", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const dialog = page.locator(".Dialog")
  await expect(dialog).toBeVisible()
})

test("should handle valid Circuit JSON input", async ({ page }) => {
  const importButton = page.getByRole("button", { name: "Import Circuit JSON" })
  await importButton.click()

  const textarea = page.locator(
    'textarea[placeholder="Paste the Circuit JSON."]',
  )
  await textarea.fill(`{
      "type": "board",
      "components": []
    }`)

  const importDialogButton = page.locator('button:has-text("Import")')
  await importDialogButton.click()

  // Wait for success toast message
  const successToast = page.locator(
    '.Toast__content:has-text("Import Successful")',
  )
  await expect(successToast).toBeVisible()
})

test("should handle valid Circuit JSON file upload", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    buffer: new Blob([JSON.stringify({ type: "board", components: [] })], {
      type: "application/json",
    }),
  })

  const importDialogButton = page.locator('button:has-text("Import")')
  await importDialogButton.click()

  // Wait for success toast message
  const successToast = page.locator(".Toast__content")
  await expect(successToast).toHaveText("Import Successful")
})

test("should handle invalid Circuit JSON input", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const textarea = page.locator(
    'textarea[placeholder="Paste the Circuit JSON."]',
  )
  await textarea.fill("invalid json content")

  const importDialogButton = page.locator('button:has-text("Import")')
  await importDialogButton.click()

  // Wait for error toast message
  const errorToast = page.locator('.Toast__content:has-text("Invalid Input")')
  await expect(errorToast).toBeVisible()
})

test("should handle invalid Circuit JSON file upload", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles("path/to/invalid/circuit.txt")

  const importDialogButton = page.locator('button:has-text("Import")')
  await importDialogButton.click()

  // Wait for error toast message
  const errorToast = page.locator(
    '.Toast__content:has-text("Error reading JSON file.")',
  )
  await expect(errorToast).toBeVisible()
})

test("should handle non-JSON file upload", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles("path/to/non-json-file.txt")

  const importDialogButton = page.locator('button:has-text("Import")')
  await importDialogButton.click()

  // Wait for error toast message
  const errorToast = page.locator(
    '.Toast__content:has-text("Please select a valid JSON file.")',
  )
  await expect(errorToast).toBeVisible()
})
