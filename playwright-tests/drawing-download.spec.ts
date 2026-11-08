import { expect, test, type Page } from "@playwright/test"
import type { CircuitJson } from "circuit-json"
import { readFile } from "node:fs/promises"
import JSZip from "jszip"
import { engineeringDrawingCircuitJson } from "../bun-tests/fixtures/engineering-drawings"

test.describe.configure({ timeout: 60000 })

const openDownloadMenu = async ({
  page,
  circuitJson,
}: { page: Page; circuitJson: CircuitJson }) => {
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
  await expect(download).toBeEnabled({ timeout: 20000 })
  await download.click()
  await page.getByRole("menuitem", { name: "Images", exact: true }).hover()
}

const expectDrawingImage = ({
  bytes,
  format,
  title,
}: { bytes: Buffer; format: "svg" | "png"; title: string }) => {
  if (format === "svg") {
    expect(bytes.toString("utf8")).toContain("<svg")
    expect(bytes.toString("utf8")).toContain(title)
  } else {
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(bytes.readUInt32BE(16)).toBeGreaterThan(1000)
    expect(bytes.readUInt32BE(20)).toBeGreaterThan(700)
  }
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  for (const format of ["svg", "png"] as const) {
    test(`downloads one ${format.toUpperCase()} drawing directly at ${viewport.width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport)
      const circuitJson = engineeringDrawingCircuitJson.filter(
        (element) =>
          !("drawing_page_id" in element) ||
          element.drawing_page_id === "carrier-inspection",
      )
      await openDownloadMenu({ page, circuitJson })
      const download = page.waitForEvent("download")
      await page
        .getByRole("menuitem", {
          name: `Engineering Drawing ${format.toUpperCase()}`,
        })
        .click()
      const drawing = await download
      expect(drawing.suggestedFilename()).toBe(
        `my-test-board-carrier-inspection.${format}`,
      )
      const imagePath = testInfo.outputPath(`drawing.${format}`)
      await drawing.saveAs(imagePath)
      expectDrawingImage({
        bytes: await readFile(imagePath),
        format,
        title: "CARRIER INSPECTION",
      })
      await expect(page.getByRole("dialog")).toHaveCount(0)
    })

    test(`automatically downloads all ${format.toUpperCase()} drawings as ZIP at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await openDownloadMenu({
        page,
        circuitJson: engineeringDrawingCircuitJson,
      })
      const download = page.waitForEvent("download")
      await page
        .getByRole("menuitem", {
          name: `Engineering Drawing ${format.toUpperCase()}`,
        })
        .click()
      const drawings = await download
      expect(drawings.suggestedFilename()).toBe(
        `my-test-board-drawings-${format}.zip`,
      )
      const zip = await JSZip.loadAsync(
        await readFile((await drawings.path())!),
      )
      expect(Object.keys(zip.files).sort()).toEqual([
        `my-test-board-carrier-inspection.${format}`,
        `my-test-board-carrier-section.${format}`,
      ])
      const inspection = await zip
        .file(`my-test-board-carrier-inspection.${format}`)!
        .async("nodebuffer")
      const section = await zip
        .file(`my-test-board-carrier-section.${format}`)!
        .async("nodebuffer")
      expectDrawingImage({
        bytes: inspection,
        format,
        title: "CARRIER INSPECTION",
      })
      expectDrawingImage({ bytes: section, format, title: "CARRIER SECTION" })
      expect(inspection.equals(section)).toBe(false)
      await expect(page.getByRole("dialog")).toHaveCount(0)
    })
  }
}

test("disables both drawing formats when the circuit has no drawing pages", async ({
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
  await expect(
    page.getByRole("menuitem", { name: "Engineering Drawing PNG" }),
  ).toBeDisabled()
})

test("reports drawing render errors without opening a picker", async ({
  page,
}) => {
  const circuitJson = engineeringDrawingCircuitJson.map((element) =>
    element.type === "drawing_part_view"
      ? { ...element, source_group_id: "missing-part" }
      : element,
  )
  await openDownloadMenu({ page, circuitJson })
  await page.getByRole("menuitem", { name: "Engineering Drawing SVG" }).click()
  await expect(
    page.getByText("Error Downloading Engineering Drawing SVG", {
      exact: true,
    }),
  ).toBeVisible()
  await expect(page.getByText(/resolved empty geometry/)).toBeVisible()
  await expect(page.getByRole("dialog")).toHaveCount(0)
})

test("existing PCB PNG downloads still use the shared rasterizer", async ({
  page,
}) => {
  await openDownloadMenu({ page, circuitJson: engineeringDrawingCircuitJson })
  const download = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "PCB PNG" }).click()
  const drawing = await download
  expect(drawing.suggestedFilename()).toBe("my-test-board_pcb.png")
  const bytes = await readFile((await drawing.path())!)
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
})
