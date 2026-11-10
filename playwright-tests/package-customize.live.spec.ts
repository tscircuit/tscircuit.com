import { expect, test } from "@playwright/test"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to a real deployment",
)

test("About opens a schema-driven customizer and keeps the release, config, views and package header", async ({
  page,
  context,
}, info) => {
  test.setTimeout(240_000)
  const errors: string[] = []
  const registryRequests: string[] = []
  let monitorRequests = false
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("request", (request) => {
    if (monitorRequests && request.url().includes("registry-api.tscircuit.com"))
      registryRequests.push(request.url())
  })
  const root = "/ShiboSoftwareDev/cc2340r5-reference-design"
  const releaseId = "e68c98ee-6946-4d75-9fba-e3ca545d412f"
  await page.goto(`${root}?version=1.3.0#schematic`)
  const customize = page.getByRole("link", { name: "Customize", exact: true })
  await expect(customize).toBeVisible({ timeout: 120_000 })
  await expect(customize.locator("svg")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Parameters", exact: true }),
  ).toHaveCount(0)
  const href = new URL(
    (await customize.getAttribute("href")) as string,
    page.url(),
  )
  expect(href.pathname).toBe(`${root}/customize`)
  expect(href.searchParams.get("package_release_id")).toBe(releaseId)
  expect(href.searchParams.get("preview_file")).toBe("dist/index/circuit.json")
  expect(href.hash).toBe("#schematic")
  const headerMonitor = await page.evaluateHandle(() => {
    const root = document.querySelector("[data-package-page]")!
    const headers = [...root.querySelectorAll(":scope > header")]
    const failures: string[] = []
    const observer = new MutationObserver(() => {
      if (!root.isConnected || headers.some((header) => !header.isConnected))
        failures.push("package header remounted")
      if (document.querySelector(".fixed.inset-0.z-50 .loading-bar"))
        failures.push("full-page loader")
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return { failures, stop: () => observer.disconnect() }
  })
  await page
    .getByRole("heading", { name: "About", exact: true })
    .locator("..")
    .locator("..")
    .screenshot({
      path: info.outputPath("about-customize-button.png"),
    })
  await customize.click()
  await expect(page).toHaveURL(
    /\/cc2340r5-reference-design\/customize\?.*#schematic$/,
  )
  const region = page.getByRole("region", { name: "Customize", exact: true })
  await expect(
    region.getByRole("link", { name: "Open package", exact: true }),
  ).toHaveCount(0)
  const panel = region.getByRole("complementary", {
    name: "Circuit parameters",
  })
  await expect(panel.getByRole("switch", { name: "SWD header" })).toBeEnabled({
    timeout: 120_000,
  })
  await expect(panel.getByRole("switch")).toHaveCount(2)
  await expect(panel.getByRole("slider")).toHaveCount(3)
  await expect(panel.locator('input[type="number"]')).toHaveCount(0)
  expect(await headerMonitor.evaluate((monitor) => monitor.failures)).toEqual(
    [],
  )
  await page.screenshot({
    path: info.outputPath("package-customizer.png"),
    fullPage: true,
  })
  await region.getByRole("button", { name: "3D", exact: true }).click()
  await expect(region.locator("canvas:visible").first()).toBeVisible({
    timeout: 60_000,
  })
  await region.getByRole("button", { name: "PCB", exact: true }).click()
  await expect(region.locator("canvas:visible").first()).toBeVisible()
  await region.getByRole("button", { name: "Schematic", exact: true }).click()
  await context.setOffline(true)
  monitorRequests = true
  await panel.getByRole("switch", { name: "External LF crystal" }).uncheck()
  await panel.getByRole("switch", { name: "SWD header" }).uncheck()
  await panel
    .getByRole("slider", { name: "Supply voltage slider" })
    .press("End")
  await panel
    .getByRole("slider", { name: "Input bulk capacitor slider" })
    .press("End")
  await panel
    .getByRole("slider", { name: "Reset pull-up slider" })
    .press("Home")
  await expect(
    panel.getByLabel("Supply voltage value", { exact: true }),
  ).toHaveText("3.3 V")
  await expect(
    panel.getByLabel("Input bulk capacitor value", { exact: true }),
  ).toHaveText("22 µF")
  await expect(
    panel.getByLabel("Reset pull-up value", { exact: true }),
  ).toHaveText("10 kΩ")
  const schematic = region
    .locator("svg:has([data-schematic-component-id])")
    .last()
  await expect(schematic).toContainText(/R14\s*10\s*k/)
  await expect(schematic).toContainText(/C2\s*22\s*[µμu]F/)
  await expect(schematic).toContainText("3.3 V supply")
  await expect(schematic.getByText("Y1", { exact: true })).toHaveCount(0)
  await expect(schematic.getByText("J4", { exact: true })).toHaveCount(0)
  await expect(region.getByRole("alert")).toHaveCount(0)
  expect(registryRequests).toEqual([])
  const back = region.getByRole("link", {
    name: "Back to package",
    exact: true,
  })
  const backHref = new URL(
    (await back.getAttribute("href")) as string,
    page.url(),
  )
  expect(backHref.pathname).toBe(root)
  expect(backHref.searchParams.get("package_release_id")).toBe(releaseId)
  expect(backHref.searchParams.get("preview_file")).toBe(
    new URL(page.url()).searchParams.get("preview_file"),
  )
  expect(backHref.hash).toBe("#schematic")
  monitorRequests = false
  await context.setOffline(false)
  await back.click()
  await expect(page).toHaveURL(backHref.href)
  await expect(customize).toBeVisible()
  expect(await headerMonitor.evaluate((monitor) => monitor.failures)).toEqual(
    [],
  )
  await headerMonitor.evaluate((monitor) => monitor.stop())
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(customize).toBeVisible()
  await customize.click()
  await expect(panel.getByRole("switch", { name: "SWD header" })).toBeEnabled()
  await expect(
    panel.getByRole("switch", { name: "SWD header" }),
  ).not.toBeChecked()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await region.screenshot({
    path: info.outputPath("package-customizer-mobile.png"),
  })
  await page.reload()
  await expect(panel.getByRole("switch", { name: "SWD header" })).toBeEnabled({
    timeout: 120_000,
  })
  await expect(
    panel.getByLabel("Reset pull-up value", { exact: true }),
  ).toHaveText("10 kΩ")
  expect(errors).toEqual([])
})

test("packages without a published configuration schema do not show a misleading Customize action", async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.goto("/imrishabh18/pedometer#files")
  await expect(
    page.getByRole("heading", { name: "About", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Customize", exact: true }),
  ).toHaveCount(0)
  await page.goto("/imrishabh18/pedometer/customize")
  const region = page.getByRole("region", { name: "Customize", exact: true })
  await expect(region).toContainText(
    "This release has no published configuration fields.",
  )
  await expect(
    region.getByRole("complementary", { name: "Circuit parameters" }),
  ).toHaveCount(0)
})
