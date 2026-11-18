import { expect, type Page, test } from "@playwright/test"
import { readFileSync } from "node:fs"

test.describe.configure({ timeout: 65_000 })

// Reduced Circuit JSON from the published Classic F1 v6.0.12 assembly.
const drawingCircuit = JSON.parse(
  readFileSync(
    new URL("./fixtures/classic-f1-service.circuit.json", import.meta.url),
    "utf8",
  ),
)
const lcdModel = readFileSync(
  new URL("./fixtures/classic-f1-lcd.obj", import.meta.url),
)
const isLcdDownload = (url: URL) =>
  url.pathname.endsWith("/package_files/download") &&
  url.searchParams.get("file_path") === "mechanical/cad/lcd-module.obj"

async function openDrawing(page: Page, circuitJson = drawingCircuit) {
  await page.route(isLcdDownload, (route) =>
    route.fulfill({ body: lcdModel, contentType: "model/obj" }),
  )
  const previewResponse = page.waitForResponse(
    "**/package_releases/get_preview_circuit_json?*",
  )
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: circuitJson,
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#drawing")
  await previewResponse
}

const drawingImage = (page: Page) =>
  page.getByRole("img", { name: "Engineering drawing: classic-f1-service" })

const drawingRenderTimeout = 20_000

test("matches the Classic F1 package drawing snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const lcdDownload = page.waitForResponse((response) =>
    isLcdDownload(new URL(response.url())),
  )
  await openDrawing(page)
  await expect(drawingImage(page)).toBeVisible({
    timeout: drawingRenderTimeout,
  })
  expect((await lcdDownload).ok()).toBe(true)
  await expect(
    page.locator('div[class~="md:flex-1"]').first(),
  ).toHaveScreenshot("classic-f1-package-drawing.png", {
    maxDiffPixelRatio: 0.01,
  })
})

for (const mobile of [false, true]) {
  test(`opens the Classic F1 Drawing view from the URL and picker (${mobile ? "mobile" : "desktop"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: mobile ? 390 : 1440, height: 1000 })
    await openDrawing(page)
    const drawing = drawingImage(page)
    await expect(drawing).toBeVisible({ timeout: drawingRenderTimeout })
    await expect(page).toHaveURL(/#drawing$/)

    if (mobile) {
      await page.getByRole("button", { name: "Drawing", exact: true }).click()
      await page.getByRole("menuitem", { name: "Files", exact: true }).click()
      await page.getByRole("button", { name: "Files", exact: true }).click()
      await page.getByRole("menuitem", { name: "Drawing", exact: true }).click()
    } else {
      await page.getByRole("button", { name: "Files", exact: true }).click()
      await page.getByRole("button", { name: "Drawing", exact: true }).click()
    }
    await expect(drawing).toBeVisible({ timeout: drawingRenderTimeout })
    await expect(page).toHaveURL(/#drawing$/)
  })
}

test("hides Drawing when the selected preview has no drawing page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openDrawing(page, drawingCircuit.slice(0, 1))
  await expect(page).toHaveURL(/#files$/)
  await expect(
    page.getByRole("button", { name: "Drawing", exact: true }),
  ).toHaveCount(0)
})
