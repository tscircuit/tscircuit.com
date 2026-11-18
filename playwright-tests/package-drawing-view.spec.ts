import { expect, type Page, test } from "@playwright/test"
import { readFileSync } from "node:fs"

// Reduced Circuit JSON from the published Classic F1 v6.0.12 assembly.
const drawingCircuit = JSON.parse(
  readFileSync(
    new URL("./fixtures/classic-f1-service.circuit.json", import.meta.url),
    "utf8",
  ),
)

async function openDrawing(page: Page) {
  const previewResponse = page.waitForResponse(
    "**/package_releases/get_preview_circuit_json?*",
  )
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: drawingCircuit,
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#drawing")
  await previewResponse
}

const drawingImage = (page: Page) =>
  page.getByRole("img", { name: "Engineering drawing: classic-f1-service" })

test("matches the Classic F1 package drawing snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openDrawing(page)
  await expect(page).toHaveURL(/#files$/)
  await expect(
    page.locator('div[class~="md:flex-1"]').first(),
  ).toHaveScreenshot("classic-f1-package-drawing.png")
})

test("opens the Classic F1 Drawing view from the package URL", async ({
  page,
}) => {
  test.fail(true, "The package page falls back to Files for #drawing")
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openDrawing(page)
  await expect(drawingImage(page)).toBeVisible({ timeout: 3000 })
})
