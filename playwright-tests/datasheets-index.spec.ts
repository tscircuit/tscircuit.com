import { test, expect } from "@playwright/test"

test("datasheet index loads all pages and links non-popular chips", async ({
  page,
}, testInfo) => {
  const chips = Array.from({ length: 503 }, (_, i) => ({
    datasheet_id: `chip-${i}`,
    chip_name: `CHIP${String(i).padStart(3, "0")}`,
  }))
  const offsets: number[] = []
  await page.route(/\/datasheets\/list\b/, async (route) => {
    const params = new URL(route.request().url()).searchParams
    expect(params.has("is_popular")).toBe(false)
    const offset = Number(params.get("offset"))
    offsets.push(offset)
    const matching = chips.filter((chip) =>
      chip.chip_name.includes(params.get("chip_name") || ""),
    )
    await route.fulfill({
      json: {
        datasheets: matching.slice(offset, offset + 500),
        next_offset: offset + 500 < matching.length ? offset + 500 : null,
      },
    })
  })
  await page.goto("http://127.0.0.1:5177/datasheets")
  const index = page.getByRole("region", { name: "Indexed datasheets" })
  await expect(index.getByRole("link")).toHaveCount(503)
  expect(offsets).toEqual([0, 500])
  await page.screenshot({ path: testInfo.outputPath("datasheet-index.png") })
  await expect(
    index.getByRole("link", { name: "CHIP502", exact: true }),
  ).toHaveAttribute("href", "/datasheets/CHIP502")
  await page
    .getByRole("searchbox", { name: "Search datasheets", exact: true })
    .fill("CHIP502")
  await expect(index.getByRole("link")).toHaveCount(1)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    index.getByRole("link", { name: "CHIP502", exact: true }),
  ).toBeVisible()
})

test("family descriptions link to package-specific pinouts", async ({
  page,
}) => {
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          datasheet_id: "family",
          chip_name: "RP2350",
          datasheet_pdf_urls: [],
          pin_information: [],
          ai_description:
            "Choose [RP2350A](/datasheets/RP2350A) or [RP2350B](/datasheets/RP2350B).",
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/RP2350")
  await expect(
    page.getByRole("link", { name: "RP2350A", exact: true }),
  ).toHaveAttribute("href", "/datasheets/RP2350A")
  await expect(
    page.getByRole("link", { name: "RP2350B", exact: true }),
  ).toHaveAttribute("href", "/datasheets/RP2350B")
})
