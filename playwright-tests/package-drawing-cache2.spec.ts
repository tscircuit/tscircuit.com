import { expect, test } from "@playwright/test"
import { readFileSync } from "node:fs"

const circuitJson = JSON.parse(
  readFileSync(
    new URL("./fixtures/classic-f1-service.circuit.json", import.meta.url),
    "utf8",
  ),
)
const alternateCircuit = circuitJson.map((element) =>
  element.type === "drawing_page"
    ? { ...element, name: "alternate-service" }
    : element,
)
const lcdModel = readFileSync(
  new URL("./fixtures/classic-f1-lcd.obj", import.meta.url),
)
const outputs = ["dist/assembly/circuit.json", "dist/alternate/circuit.json"]

test("Drawing loads on first use and resets when the selected build changes", async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1440, height: 1000 })
  let modelDownloads = 0
  await page.route(
    (url) =>
      url.pathname.endsWith("/package_files/download") &&
      url.searchParams.get("file_path") === "mechanical/cad/lcd-module.obj",
    (route) => {
      modelDownloads++
      return route.fulfill({ body: lcdModel, contentType: "model/obj" })
    },
  )
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          component_path: "assembly.tsx",
          circuit_json: circuitJson,
        },
      },
    }),
  )
  await page.route("**/package_files/list?*", (route) =>
    route.fulfill({
      json: {
        ok: true,
        package_files: outputs.map((file_path, index) => ({
          package_file_id: `drawing-cache-${index}`,
          package_release_id: "package_release_3",
          file_path,
          created_at: "2026-01-01T00:00:00Z",
        })),
      },
    }),
  )
  await page.route("**/package_files/get?*", (route) => {
    const fileId = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )
    if (!fileId?.startsWith("drawing-cache-")) return route.continue()
    return route.fulfill({
      json: {
        package_file: {
          content_text: JSON.stringify(
            fileId === "drawing-cache-1" ? alternateCircuit : circuitJson,
          ),
        },
      },
    })
  })
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
  const drawingTab = page.getByRole("button", { name: "Drawing", exact: true })
  await expect(drawingTab).toBeVisible({ timeout: 20_000 })
  expect(modelDownloads).toBe(0)
  await drawingTab.click()
  const originalDrawing = page.getByRole("img", {
    name: "Engineering drawing: classic-f1-service",
  })
  await expect(originalDrawing).toBeVisible({ timeout: 20_000 })
  const renderedImage = await originalDrawing.elementHandle()
  const firstDownloads = modelDownloads
  await page.getByRole("combobox", { name: "Preview file" }).click()
  await page
    .getByRole("option", { name: "alternate/circuit.json", exact: true })
    .click()
  await expect(
    page.getByRole("img", {
      name: "Engineering drawing: alternate-service",
    }),
  ).toBeVisible({ timeout: 20_000 })
  expect(await renderedImage!.evaluate((image) => image.isConnected)).toBe(
    false,
  )
  expect(modelDownloads).toBeGreaterThan(firstDownloads)
  await expect(
    page.locator('div[class~="md:flex-1"]').first(),
  ).toHaveScreenshot("drawing-selected-build.png", { maxDiffPixelRatio: 0.01 })
})
