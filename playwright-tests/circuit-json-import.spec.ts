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
  const successToast = page.locator(
    'div.text-sm.font-semibold:has-text("Import Successful")',
  )
  await successToast.waitFor({ state: "visible", timeout: 5000 })
  await expect(successToast).toBeVisible()
})

test("should handle invalid Circuit JSON input", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const textarea = page.locator(
    'textarea[placeholder="Paste the Circuit JSON."]',
  )
  await textarea.fill("invalid json content")

  const importDialogButton = page.getByRole("button", { name: "Import" })
  await importDialogButton.click()

  const errorToast = page.locator(
    'div.text-sm.font-semibold:has-text("Invalid Input")',
  )
  await errorToast.waitFor({ state: "visible", timeout: 5000 })
  await expect(errorToast).toBeVisible()
})

test("should handle invalid Circuit JSON file upload", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    // @ts-expect-error didnt add node types to tsconfig
    buffer: Buffer.from(JSON.stringify({})),
  })

  const importDialogButton = page.getByRole("button", { name: "Import" })
  await importDialogButton.click()

  const errorToast = page.locator(
    'div.text-sm.font-semibold:has-text("Import Failed")',
  )
  await errorToast.waitFor({ state: "visible", timeout: 5000 })
  await expect(errorToast).toBeVisible()
})

test("should handle non-JSON file upload", async ({ page }) => {
  const importButton = page.locator('button:has-text("Import Circuit JSON")')
  await importButton.click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: "circuit.txt",
    mimeType: "application/text",
    // @ts-expect-error didnt add node types to tsconfig
    buffer: Buffer.from(""),
  })

  const importDialogButton = page.getByRole("button", { name: "Import" })
  await importDialogButton.click()

  const errorToast = page.locator(
    'div.pb-4 > p:has-text("Please select a valid JSON file.")',
  )
  await expect(errorToast).toBeVisible()
})
