import { test, expect } from "@playwright/test"
import { getUncompressedSnippetString } from "@tscircuit/create-snippet-url"
import rp2040 from "./fixtures/rp2040-datasheet.json" with { type: "json" }

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect x="40" y="30" width="120" height="240" fill="white" stroke="black"/><text x="100" y="150" text-anchor="middle">RP2040</text></svg>`

test.beforeEach(async ({ page }) => {
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({ json: { datasheet: rp2040 } }),
  )
})

test("shows both RP2040 previews side by side on desktop and stacked on mobile", async ({
  page,
}, testInfo) => {
  const requests = { pcb: 0, schematic: 0 }
  await page.route("https://svg.tscircuit.com/**", (route) => {
    const url = new URL(route.request().url())
    const view = url.searchParams.get("svg_type") as keyof typeof requests
    requests[view]++
    if (view === "schematic") {
      const source = getUncompressedSnippetString(url.searchParams.get("code")!)
      expect(source).toContain("schPinArrangement=")
      expect(source).toContain('"pin57"')
      expect(source).toContain("GPIO29")
      expect(source).toContain("QSPI_CSn")
      expect(source).not.toContain("pinAttributes=")
      expect(source).not.toContain("footprint=")
    }
    return route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/RP2040")
  await expect(page.getByRole("tab")).toHaveCount(0)
  const footprintPreview = page.getByRole("img", {
    name: "RP2040 PCB footprint",
  })
  await expect(footprintPreview).toBeVisible()
  const preview = page.getByRole("img", { name: "RP2040 schematic symbol" })
  await expect(preview).toBeVisible()
  await expect(
    page.getByText("Loading schematic symbol…", { exact: true }),
  ).toHaveCount(0)
  expect(
    await preview.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0)
  expect(requests).toEqual({ pcb: 1, schematic: 1 })
  const footprintBounds = (await footprintPreview.boundingBox())!
  const schematicBounds = (await preview.boundingBox())!
  expect(schematicBounds.x).toBeGreaterThan(
    footprintBounds.x + footprintBounds.width,
  )
  expect(schematicBounds.y).toBe(footprintBounds.y)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(preview).toBeVisible()
  await expect(footprintPreview).toBeVisible()
  const mobileFootprint = (await footprintPreview.boundingBox())!
  const mobileSchematic = (await preview.boundingBox())!
  expect(mobileSchematic.y).toBeGreaterThan(
    mobileFootprint.y + mobileFootprint.height,
  )
  expect(mobileSchematic.x).toBe(mobileFootprint.x)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  await page.screenshot({
    path: testInfo.outputPath("schematic-pair-mobile.png"),
    fullPage: true,
  })
})

test("allows retry when the schematic preview fails", async ({ page }) => {
  let schematicAttempts = 0
  await page.route("https://svg.tscircuit.com/**", (route) => {
    if (
      new URL(route.request().url()).searchParams.get("svg_type") ===
      "schematic"
    ) {
      schematicAttempts++
      if (schematicAttempts === 1) return route.abort()
    }
    return route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/RP2040")
  await expect(page.getByRole("alert")).toContainText(
    "Schematic preview could not be loaded.",
  )
  await page.getByRole("button", { name: "Retry preview" }).click()
  await expect(page.getByRole("alert")).toHaveCount(0)
  await expect(
    page.getByText("Loading schematic symbol…", { exact: true }),
  ).toHaveCount(0)
  expect(schematicAttempts).toBe(2)
})

test("shows a builtin symbol without an empty footprint panel", async ({
  page,
}) => {
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          ...rp2040,
          footprinter_string: null,
          sch_pin_arrangement: null,
          builtin_symbol_name: "diode",
        },
      },
    }),
  )
  let symbolRequests = 0
  await page.route("https://svg.tscircuit.com/**", (route) => {
    symbolRequests++
    const url = new URL(route.request().url())
    expect(url.searchParams.get("svg_type")).toBe("schematic")
    expect(
      getUncompressedSnippetString(url.searchParams.get("code")!),
    ).toContain("diode")
    return route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/RP2040")
  await expect(page.getByRole("tab")).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Footprint", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("img", { name: "RP2040 schematic symbol" }),
  ).toBeVisible()
  expect(symbolRequests).toBe(1)
})

test("renders custom symbol JSX through the SVG service without executing it in the page", async ({
  page,
}) => {
  const symbolTsx =
    '<symbol><text text={"</script><script>window.customSymbolExecuted = true</script>"} /></symbol>'
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          ...rp2040,
          sch_pin_arrangement: null,
          symbol_tsx: symbolTsx,
        },
      },
    }),
  )
  await page.route("https://svg.tscircuit.com/**", (route) => {
    const url = new URL(route.request().url())
    if (url.searchParams.get("svg_type") === "schematic") {
      expect(
        getUncompressedSnippetString(url.searchParams.get("code")!),
      ).toContain(`symbol={${symbolTsx}}`)
    }
    return route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/RP2040")
  await expect(
    page.getByRole("img", { name: "RP2040 schematic symbol" }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => (window as any).customSymbolExecuted),
  ).toBeUndefined()
})
