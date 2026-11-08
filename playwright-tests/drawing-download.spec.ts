import { expect, test, type Page } from "@playwright/test"
import type { CircuitJson } from "circuit-json"
import { readFile } from "node:fs/promises"
import JSZip from "jszip"
import { engineeringDrawingCircuitJson } from "../bun-tests/fixtures/engineering-drawings"

test.describe.configure({ timeout: 60000 })

const openDownloadMenu = async ({
  page,
  circuitJson,
}: {
  page: Page
  circuitJson: CircuitJson
}) => {
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
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
  const download = page.getByRole("button", { name: "Download", exact: true })
  await expect(download).toBeEnabled()
  await download.click()
  await page.getByRole("menuitem", { name: "Images", exact: true }).hover()
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`downloads the chosen engineering drawing at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await openDownloadMenu({ page, circuitJson: engineeringDrawingCircuitJson })
    await page
      .getByRole("menuitem", { name: "Engineering Drawing SVG" })
      .click()
    const dialog = page.getByRole("dialog", {
      name: "Download Engineering Drawing",
    })
    await expect(dialog).toBeVisible()
    await dialog.getByRole("combobox", { name: "Drawing", exact: true }).click()
    await page
      .getByRole("option", { name: "Mounting hole section", exact: true })
      .click()
    const download = page.waitForEvent("download")
    await dialog
      .getByRole("button", { name: "Download SVG", exact: true })
      .click()
    const drawing = await download
    expect(drawing.suggestedFilename()).toBe(
      "my-test-board-carrier-section.svg",
    )
    const svg = await readFile((await drawing.path())!, "utf8")
    expect(svg).toContain("CARRIER SECTION")
    expect(svg).not.toContain("CARRIER INSPECTION")
    await expect(dialog).not.toBeVisible()
  })

  test(`downloads all engineering drawings in one ZIP at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await openDownloadMenu({ page, circuitJson: engineeringDrawingCircuitJson })
    await page
      .getByRole("menuitem", { name: "Engineering Drawing SVG" })
      .click()
    const dialog = page.getByRole("dialog", {
      name: "Download Engineering Drawing",
    })
    await dialog.screenshot({
      path: testInfo.outputPath("download-all-dialog.png"),
    })
    const download = page.waitForEvent("download")
    await dialog
      .getByRole("button", { name: "Download all (ZIP)", exact: true })
      .click()
    const drawings = await download
    expect(drawings.suggestedFilename()).toBe("my-test-board-drawings.zip")
    const zip = await JSZip.loadAsync(await readFile((await drawings.path())!))
    expect(Object.keys(zip.files).sort()).toEqual([
      "my-test-board-carrier-inspection.svg",
      "my-test-board-carrier-section.svg",
    ])
    expect(
      await zip.file("my-test-board-carrier-inspection.svg")!.async("string"),
    ).toContain("CARRIER INSPECTION")
    expect(
      await zip.file("my-test-board-carrier-section.svg")!.async("string"),
    ).toContain("CARRIER SECTION")
    await expect(dialog).not.toBeVisible()
  })
}

test("downloads a single drawing without requiring a selection change", async ({
  page,
}) => {
  const circuitJson = engineeringDrawingCircuitJson.filter(
    (element) =>
      !("drawing_page_id" in element) ||
      element.drawing_page_id === "carrier-inspection",
  )
  await openDownloadMenu({ page, circuitJson })
  await page.getByRole("menuitem", { name: "Engineering Drawing SVG" }).click()
  const dialog = page.getByRole("dialog", {
    name: "Download Engineering Drawing",
  })
  await expect(dialog.getByRole("combobox")).toHaveText("Carrier inspection")
  const download = page.waitForEvent("download")
  await dialog
    .getByRole("button", { name: "Download SVG", exact: true })
    .click()
  expect((await download).suggestedFilename()).toBe(
    "my-test-board-carrier-inspection.svg",
  )
})

test("disables engineering drawing downloads when the circuit has no drawing pages", async ({
  page,
}) => {
  await openDownloadMenu({
    page,
    circuitJson: engineeringDrawingCircuitJson.filter(
      (element) => element.type === "pcb_board",
    ),
  })
  await expect(
    page.getByRole("menuitem", { name: "Engineering Drawing SVG" }),
  ).toBeDisabled()
})

test("keeps the dialog open and reports drawing render errors", async ({
  page,
}) => {
  const circuitJson = engineeringDrawingCircuitJson.map((element) =>
    element.type === "drawing_part_view"
      ? { ...element, source_group_id: "missing-part" }
      : element,
  )
  await openDownloadMenu({ page, circuitJson })
  await page.getByRole("menuitem", { name: "Engineering Drawing SVG" }).click()
  const dialog = page.getByRole("dialog", {
    name: "Download Engineering Drawing",
  })
  await dialog
    .getByRole("button", { name: "Download SVG", exact: true })
    .click()
  await expect(dialog.getByRole("alert")).toContainText("empty geometry")
  await expect(
    dialog.getByRole("button", { name: "Download SVG", exact: true }),
  ).toBeEnabled()
})
