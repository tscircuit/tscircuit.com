import { test, expect } from "@playwright/test"
import { getUncompressedSnippetString } from "@tscircuit/create-snippet-url"

const footprint = "qfp64_w10_h10_p0.5"
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect x="40" y="40" width="120" height="120" fill="#333"/><path d="M20 60h20 M20 80h20 M20 100h20 M20 120h20 M160 60h20 M160 80h20 M160 100h20 M160 120h20" stroke="#e69c26" stroke-width="8"/></svg>`

test.beforeEach(async ({ page }) => {
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          datasheet_id: "footprint-example",
          chip_name: "EXAMPLE64",
          datasheet_pdf_urls: [],
          pin_information: [],
          ai_description: "Example processor with a stored footprint.",
          footprinter_string: footprint,
          generated_tsx: 'throw new Error("must not execute this code")',
        },
      },
    }),
  )
})

test("shows the stored string and safely generated PCB SVG at desktop and mobile widths", async ({
  page,
}, testInfo) => {
  let requestCount = 0
  await page.route("https://svg.tscircuit.com/**", async (route) => {
    requestCount++
    const url = new URL(route.request().url())
    expect(url.searchParams.get("svg_type")).toBe("pcb")
    expect(url.searchParams.get("show_solder_mask")).toBe("0")
    expect(getUncompressedSnippetString(url.searchParams.get("code")!)).toBe(
      `export default () => <chip name="U1" footprint={${JSON.stringify(footprint)}} />`,
    )
    await route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE64")
  await expect(
    page.getByRole("heading", { name: "Footprint", exact: true }),
  ).toBeVisible()
  await expect(
    page.locator("code").filter({ hasText: footprint }),
  ).toBeVisible()
  const preview = page.getByRole("img", { name: "EXAMPLE64 PCB footprint" })
  await expect(preview).toBeVisible()
  await expect(
    page.getByText("Loading footprint…", { exact: true }),
  ).toHaveCount(0)
  expect(
    await preview.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0)
  expect(requestCount).toBe(1)
  await page.screenshot({
    path: testInfo.outputPath("footprint-desktop.png"),
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(preview).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  await page.screenshot({
    path: testInfo.outputPath("footprint-mobile.png"),
    fullPage: true,
  })
})

test("keeps the string visible on preview failure and allows retry", async ({
  page,
}) => {
  let attempts = 0
  await page.route("https://svg.tscircuit.com/**", async (route) => {
    attempts++
    if (attempts === 1) await route.abort()
    else await route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE64")
  await expect(page.getByRole("alert")).toHaveText(
    "Footprint preview could not be loaded.Retry preview",
  )
  await expect(
    page.locator("code").filter({ hasText: footprint }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Retry preview" }).click()
  await expect(page.getByRole("alert")).toHaveCount(0)
  await expect(
    page.getByText("Loading footprint…", { exact: true }),
  ).toHaveCount(0)
  expect(attempts).toBe(2)
})

test("bounds a stalled preview request and clears its loading state", async ({
  page,
}) => {
  await page.clock.install()
  await page.route("https://svg.tscircuit.com/**", () => {})
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE64", {
    waitUntil: "domcontentloaded",
  })
  await expect(
    page.getByText("Loading footprint…", { exact: true }),
  ).toBeVisible()
  await page.clock.fastForward(20_000)
  await expect(
    page.getByRole("button", { name: "Retry preview" }),
  ).toBeVisible()
  await expect(
    page.getByText("Loading footprint…", { exact: true }),
  ).toHaveCount(0)
})

test("does not request a preview when footprint metadata is absent", async ({
  page,
}) => {
  let requests = 0
  await page.route("https://svg.tscircuit.com/**", async (route) => {
    requests++
    await route.fulfill({ contentType: "image/svg+xml", body: svg })
  })
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          chip_name: "EXAMPLE64",
          pin_information: [],
          datasheet_pdf_urls: [],
          ai_description: "No stored footprint.",
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE64")
  await expect(
    page.getByText("No stored footprint.", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Footprint", exact: true }),
  ).toHaveCount(0)
  expect(requests).toBe(0)
})
