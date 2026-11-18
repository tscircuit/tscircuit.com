import { expect, test } from "@playwright/test"
import { readFileSync } from "node:fs"

// The same Classic F1 assembly and relative LCD model used by the Drawing tests.
const circuitJson = JSON.parse(
  readFileSync(
    new URL("./fixtures/classic-f1-service.circuit.json", import.meta.url),
    "utf8",
  ),
)
const lcdModel = readFileSync(
  new URL("./fixtures/classic-f1-lcd.obj", import.meta.url),
)

test("returning to Classic F1 keeps the rendered drawing and its model assets", async ({
  page,
}) => {
  test.setTimeout(65_000)
  await page.setViewportSize({ width: 1440, height: 1000 })
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
  let blockDownloads = false
  let repeatedDownloads = 0
  await page.route(
    (url) =>
      url.pathname.endsWith("/package_files/download") &&
      url.searchParams.get("file_path") === "mechanical/cad/lcd-module.obj",
    (route) => {
      if (blockDownloads) {
        // A cached drawing must remain available even when the network stalls.
        repeatedDownloads++
        return
      }
      return route.fulfill({ body: lcdModel, contentType: "model/obj" })
    },
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#drawing")
  const drawing = page.getByRole("img", {
    name: "Engineering drawing: classic-f1-service",
  })
  await expect(drawing).toBeVisible({ timeout: 20_000 })
  const renderedImage = await drawing.elementHandle()
  expect(renderedImage).not.toBeNull()

  await page.getByRole("button", { name: "Files", exact: true }).click()
  await expect(drawing).toBeHidden()
  blockDownloads = true
  await page.getByRole("button", { name: "Drawing", exact: true }).click()

  // Keep the actual visual result enforced before marking the cache assertion
  // as an expected failure. A snapshot failure must still fail the repro PR.
  await expect(
    page.locator('div[class~="md:flex-1"]').first(),
  ).toHaveScreenshot("classic-f1-return-to-drawing.png", {
    maxDiffPixelRatio: 0.01,
  })

  expect(await renderedImage!.evaluate((image) => image.isConnected)).toBe(true)
  await expect(drawing).toBeVisible({ timeout: 1000 })
  expect(repeatedDownloads).toBe(0)
})
