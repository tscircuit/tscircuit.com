import { expect, test } from "@playwright/test"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)

test("datasheets link to a design index and a dedicated, shared design page with real change highlights", async ({
  page,
}, info) => {
  test.setTimeout(240_000)
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/datasheets/CC2340R52E0RGER")
  await expect(
    page.getByRole("region", { name: "Reference design", exact: true }),
  ).toHaveCount(0)
  await page
    .getByRole("link", { name: "Reference designs", exact: true })
    .click()
  await expect(page).toHaveURL(
    /\/datasheets\/CC2340R52E0RGER\/reference-designs$/,
  )
  const breadcrumbs = page.getByRole("navigation", { name: "breadcrumb" })
  await expect(breadcrumbs).toContainText("Reference designs")
  await expect(
    page.getByRole("complementary", { name: "Circuit parameters" }),
  ).toHaveCount(0)
  await page.getByRole("link", { name: /cc2340r5-reference-design/ }).click()
  await expect(page).toHaveURL(
    /\/reference-designs\/ShiboSoftwareDev\/cc2340r5-reference-design$/,
  )
  await expect(breadcrumbs).toContainText("cc2340r5-reference-design")
  const region = page.getByRole("region", {
    name: "Reference design",
    exact: true,
  })
  await expect(
    region.getByRole("button", { name: "Schematic", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  const panel = region.getByRole("complementary", {
    name: "Circuit parameters",
  })
  const summary = region.getByRole("status", { name: "Configuration changes" })
  await expect(
    panel.getByRole("switch", { name: "External LF crystal" }),
  ).toBeEnabled({ timeout: 120_000 })
  await expect(summary).toHaveCount(0)
  await page.screenshot({
    path: info.outputPath("reference-design-page.png"),
    fullPage: true,
  })
  await panel
    .getByRole("slider", { name: "Reset pull-up slider" })
    .press("Home")
  await expect(
    panel.getByLabel("Reset pull-up previous value", { exact: true }),
  ).toContainText("100")
  await expect(
    summary.getByRole("button", { name: "R14 Changed", exact: true }),
  ).toBeVisible()
  const resistor = region
    .locator("svg g[data-schematic-component-id]")
    .filter({ has: page.getByText("R14", { exact: true }) })
  await expect
    .poll(() =>
      resistor
        .locator(".sch-component-text")
        .last()
        .evaluate((element) => getComputedStyle(element).fill),
    )
    .toBe("rgb(217, 119, 6)")
  await region.screenshot({
    path: info.outputPath("changed-resistor-value.png"),
  })
  await panel
    .getByRole("slider", { name: "Supply voltage slider" })
    .press("End")
  await expect(summary).toContainText("Annotations changed")
  const supply = region
    .locator("svg text[data-schematic-text-id]")
    .filter({ hasText: "3.3 V supply" })
  await expect
    .poll(() => supply.evaluate((element) => getComputedStyle(element).fill))
    .toBe("rgb(217, 119, 6)")
  await panel.getByRole("switch", { name: "External LF crystal" }).uncheck()
  await expect(summary).toContainText("Y1")
  await expect(region.locator('[data-component-change="removed"]')).toHaveCount(
    3,
  )
  await expect(
    region.locator('svg .sch-path[stroke="#dc2626"][stroke-dasharray]'),
  ).toHaveCount(3)
  await region.screenshot({
    path: info.outputPath("removed-parts-highlight.png"),
  })
  await region.getByRole("button", { name: "PCB", exact: true }).click()
  await expect(region.getByRole("alert")).toHaveCount(0)
  await expect(region.locator("canvas:visible").first()).toBeVisible()
  const pcbHighlights = region.locator(
    'canvas[style*="opacity: 0.5"][style*="pointer-events: none"]',
  )
  const highlightPixels = () =>
    pcbHighlights.evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data
      let count = 0
      for (let index = 3; index < pixels.length; index += 4)
        if (pixels[index] > 0) count++
      return count
    })
  await expect.poll(highlightPixels).toBeGreaterThan(0)
  await region.screenshot({ path: info.outputPath("pcb-highlight.png") })
  const selection = page.url()
  await summary.getByRole("button", { name: "Clear highlights" }).click()
  await expect(summary).toHaveCount(0)
  await expect.poll(highlightPixels).toBe(0)
  expect(page.url()).toBe(selection)
  await region.getByRole("button", { name: "Schematic", exact: true }).click()
  await expect(
    region.locator('svg .sch-path[stroke="#dc2626"][stroke-dasharray]'),
  ).toHaveCount(0)
  const before = page.url(),
    popupPending = page.waitForEvent("popup")
  await region.getByRole("link", { name: "Open package", exact: true }).click()
  const popup = await popupPending
  await expect(popup).toHaveURL(
    /\/ShiboSoftwareDev\/cc2340r5-reference-design\?.*#schematic$/,
  )
  expect(page.url()).toBe(before)
  await popup.close()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await region.screenshot({
    path: info.outputPath("reference-design-mobile.png"),
  })
  await breadcrumbs
    .getByRole("link", { name: "Reference designs", exact: true })
    .click()
  await expect(page).toHaveURL(/\/reference-designs$/)
  expect(errors).toEqual([])
})
