import { test, expect } from "@playwright/test"
import { validCircuitJson } from "./circuit"

async function loginToSite(page) {
  const loginButton = page.getByRole("button", { name: "Log in" })
  if (await loginButton.isVisible()) {
    await loginButton.click()
    await page.waitForLoadState("networkidle")
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/quickstart")
  await page.waitForTimeout(3000)
  await loginToSite(page).catch(() => {})
})

test("should open and close the Circuit Json Import Dialog", async ({
  page,
}) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()

  const closeButton = dialog.getByRole("button", { name: "Close" })
  await closeButton.click()

  await expect(dialog).not.toBeVisible()
})

test("should open the Circuit Json Import Dialog", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()
  await expect(page.getByRole("dialog")).toBeVisible()
})

test("should handle valid Circuit JSON input", async ({ page }) => {
  const importButton = page.getByRole("button", { name: "Import Circuit JSON" })
  await importButton.click()
  const textarea = page.locator(
    'textarea[placeholder="Paste the Circuit JSON."]',
  )
  await textarea.fill(JSON.stringify(validCircuitJson))

  const importDialogButton = page.getByRole("button", { name: "Import" })
  await importDialogButton.click()

  const successToast = page.locator(
    'div.text-sm.font-semibold:has-text("Import Successful")',
  )
  await successToast.waitFor({ state: "visible", timeout: 5000 })
  await expect(successToast).toBeVisible()
})

test("should handle valid Circuit JSON file upload", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')

  await fileInput.setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    // @ts-expect-error didnt add node types to tsconfig
    buffer: Buffer.from(JSON.stringify(validCircuitJson)),
  })

  const importDialogButton = page.getByRole("button", { name: "Import" })
  await importDialogButton.click()
  await page.screenshot({ path: "todo-page-screenshot.png" })
  const successToast = page.locator(
    'div.text-sm.font-semibold:has-text("Import Successful")',
  )
  await successToast.waitFor({ state: "visible", timeout: 5000 })
  await page.screenshot({ path: "todo-page-screenshot.png" })
  await expect(successToast).toBeVisible()
})

test.skip("should handle invalid Circuit JSON input", async ({ page }) => {
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

test.skip("should handle invalid Circuit JSON file upload", async ({
  page,
}) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    buffer: new Blob([JSON.stringify({})], {
      type: "application/json",
    }),
  })

  const importDialogButton = page.locator('button:has-text("Import")')
  await importDialogButton.click()

  // Wait for error toast message
  const errorToast = page.locator(
    '.Toast__content:has-text("Error reading JSON file.")',
  )
  await expect(errorToast).toBeVisible()
})

test.skip("should handle non-JSON file upload", async ({ page }) => {
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
