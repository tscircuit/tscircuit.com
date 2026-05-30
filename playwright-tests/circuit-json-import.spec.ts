import { type Page, expect, test } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

const quickstartUrl = "http://127.0.0.1:5177/quickstart"

const openImportDialog = async (page: Page) => {
  await page.goto(quickstartUrl)
  await page.getByRole("button", { name: "Import JSON" }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
}

test("allows anonymous Circuit JSON paste import into the editor", async ({
  page,
}) => {
  await openImportDialog(page)

  await page
    .locator('textarea[placeholder="Paste the Circuit JSON."]')
    .fill(JSON.stringify(exampleCircuitJson))

  const importButton = page.getByRole("button", { name: "Import" })
  await expect(importButton).toBeEnabled()
  await importButton.click()

  await page.waitForURL(
    /\/editor\?snippet_type=package#data:application\/gzip;base64,/,
  )
  await expect(page).toHaveURL(
    /\/editor\?snippet_type=package#data:application\/gzip;base64,/,
  )
})

test("allows anonymous Circuit JSON file upload into the editor", async ({
  page,
}) => {
  await openImportDialog(page)

  await page.locator('input[type="file"]').setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exampleCircuitJson)),
  })

  await expect(page.getByText("Selected file:").first()).toBeVisible()
  await page.getByRole("button", { name: "Import" }).click()

  await expect(page).toHaveURL(
    /\/editor\?snippet_type=package#data:application\/gzip;base64,/,
  )
})

test("keeps import disabled until JSON content or a file is provided", async ({
  page,
}) => {
  await openImportDialog(page)

  await expect(page.getByRole("button", { name: "Import" })).toBeDisabled()
})

test("shows a validation error for invalid Circuit JSON file uploads", async ({
  page,
}) => {
  await openImportDialog(page)

  await page.locator('input[type="file"]').setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    buffer: Buffer.from("not valid json"),
  })

  await expect(
    page.getByText("Please select a valid JSON file that can be parsed."),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Import" })).toBeDisabled()
})
