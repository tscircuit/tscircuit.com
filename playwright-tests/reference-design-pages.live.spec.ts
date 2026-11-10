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
  const boxes = region.locator("svg rect[data-preview-change-highlight]")
  const removedBoxes = region.locator(
    'svg .sch-path[stroke="#3b82f6"][stroke-dasharray]',
  )
  await expect(
    panel.getByRole("switch", { name: "External LF crystal" }),
  ).toBeEnabled({ timeout: 120_000 })
  await expect(boxes).toHaveCount(0)
  await page.screenshot({
    path: info.outputPath("reference-design-page.png"),
    fullPage: true,
  })
  const resistor = region
    .locator("svg g[data-schematic-component-id]")
    .filter({ has: page.getByText("R14", { exact: true }) })
  const originalTextColor = await resistor
    .locator(".sch-component-text")
    .last()
    .evaluate((element) => getComputedStyle(element).fill)
  await panel
    .getByRole("slider", { name: "Reset pull-up slider" })
    .press("Home")
  await expect(boxes).toHaveCount(1)
  await expect(
    resistor.locator("rect[data-preview-change-highlight]"),
  ).toHaveCount(1)
  await expect(boxes).toHaveAttribute("fill", "none")
  await expect(boxes).toHaveAttribute("stroke-dasharray", "4 3")
  expect(
    await resistor
      .locator(".sch-component-text")
      .last()
      .evaluate((element) => getComputedStyle(element).fill),
  ).toBe(originalTextColor)
  await expect(
    region.getByRole("status", { name: "Configuration changes" }),
  ).toHaveCount(0)
  await expect(panel.locator("s, [data-parameter-changed]")).toHaveCount(0)
  await region.screenshot({ path: info.outputPath("changed-resistor-box.png") })
  // The next change replaces the old box and cancels its expiry timer.
  await page.waitForTimeout(1600)
  await panel
    .getByRole("slider", { name: "Supply voltage slider" })
    .press("End")
  await expect(
    resistor.locator("rect[data-preview-change-highlight]"),
  ).toHaveCount(0)
  const annotationBoxes = region.locator(
    'svg rect[data-preview-change-highlight^="schematic_text"]',
  )
  await expect(annotationBoxes.first()).toBeVisible()
  const nextBoxCount = await boxes.count()
  await region.screenshot({
    path: info.outputPath("changed-voltage-boxes.png"),
  })
  await page.waitForTimeout(1600)
  await expect(boxes).toHaveCount(nextBoxCount)
  const selection = page.url()
  await expect(boxes).toHaveCount(0, { timeout: 5000 })
  expect(page.url()).toBe(selection)
  await expect(
    panel.getByLabel("Supply voltage value", { exact: true }),
  ).toHaveText("3.3 V")
  await panel.getByRole("switch", { name: "External LF crystal" }).uncheck()
  await expect(boxes).toHaveCount(0)
  await expect(removedBoxes).toHaveCount(0)
  await region.screenshot({ path: info.outputPath("removed-parts-boxes.png") })
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
  await expect.poll(highlightPixels).toBe(0)
  await region.screenshot({
    path: info.outputPath("removed-parts-pcb-no-boxes.png"),
  })
  // Reappearing parts receive boxes in both viewers; removed parts never do.
  await panel.getByRole("switch", { name: "External LF crystal" }).check()
  await expect.poll(highlightPixels).toBeGreaterThan(0)
  await region.getByRole("button", { name: "Schematic", exact: true }).click()
  await expect(
    region.locator(
      "svg g[data-schematic-component-id] > rect[data-preview-change-highlight]",
    ),
  ).toHaveCount(3)
  for (const name of ["Y1", "C14", "C15"])
    await expect(
      region
        .locator("svg g[data-schematic-component-id]")
        .filter({ has: page.getByText(name, { exact: true }) })
        .locator("rect[data-preview-change-highlight]"),
    ).toHaveCount(1)
  await expect(removedBoxes).toHaveCount(0)
  await region.screenshot({ path: info.outputPath("added-parts-boxes.png") })
  await region.getByRole("button", { name: "PCB", exact: true }).click()
  await region.screenshot({
    path: info.outputPath("added-parts-pcb-boxes.png"),
  })
  await expect.poll(highlightPixels, { timeout: 5000 }).toBe(0)
  await region.getByRole("button", { name: "Schematic", exact: true }).click()
  await expect(removedBoxes).toHaveCount(0)
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
