import { expect, test, type Locator, type Page } from "@playwright/test"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)

async function activateViewer(page: Page, region: Locator) {
  const overlay = region.getByText("Click to Interact", { exact: true })
  if (await overlay.isVisible()) {
    const bounds = await overlay.boundingBox()
    if (!bounds) throw new Error("Viewer overlay has no bounds")
    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    )
    await expect(overlay).not.toBeVisible()
  }
}

test("datasheet configurations and all three views work inline and retain their release and selection", async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  const glbRequests = new Set<string>()
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("response", (response) => {
    if (
      response.url().includes("/package_files/download?") &&
      response.status() < 400
    )
      glbRequests.add(
        new URL(response.url()).searchParams.get("package_file_id")!,
      )
  })
  const listResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/package_files/list?") &&
      response.status() === 200,
  )
  await page.goto("/datasheets/NE555DR#reference-designs")
  const region = page.getByRole("region", { name: "Reference designs" })
  await region.scrollIntoViewIfNeeded()
  const picker = region.getByRole("combobox", { name: "Configuration" })
  await expect(picker).toBeVisible()
  const { package_files: files } = await (await listResponse).json()

  for (const [preset, label] of [
    ["", "Default"],
    ["full_board", "Full board"],
    ["slow", "Slow"],
    ["without_led", "Without LED"],
  ]) {
    await region.getByRole("button", { name: "PCB", exact: true }).click()
    const prefix = `dist/index/${preset ? `${preset}/` : ""}`
    const file = files.find(
      (item: any) => item.file_path === `${prefix}circuit.json`,
    )
    const glb = files.find((item: any) => item.file_path === `${prefix}3d.glb`)
    await picker.click()
    const circuitResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/package_files/get?") &&
        new URL(response.url()).searchParams.get("package_file_id") ===
          file.package_file_id,
    )
    await page.getByRole("option", { name: label, exact: true }).click()
    const { package_file } = await (await circuitResponse).json()
    const circuit = JSON.parse(package_file.content_text)
    const capacitor = circuit.find(
      (item: any) => item.type === "source_component" && item.name === "C1",
    )
    expect(capacitor.capacitance).toBeCloseTo(
      preset === "slow" ? 100e-6 : 10e-6,
      9,
    )
    expect(
      circuit.some(
        (item: any) => item.type === "source_component" && item.name === "D1",
      ),
    ).toBe(preset !== "without_led")
    expect(new URL(page.url()).pathname).toBe("/datasheets/NE555DR")
    expect(new URL(page.url()).searchParams.get("reference_file")).toBe(
      `${prefix}circuit.json`,
    )
    await expect(region.locator("canvas:visible").first()).toBeVisible()
    await activateViewer(page, region)
    await region.screenshot({
      path: testInfo.outputPath(`${preset || "default"}-pcb.png`),
    })

    await region.getByRole("button", { name: "Schematic", exact: true }).click()
    const symbol = circuit.find(
      (item: any) =>
        item.type === "schematic_component" &&
        item.source_component_id === capacitor.source_component_id,
    )
    await expect(
      region
        .locator(
          `[data-schematic-component-id="${symbol.schematic_component_id}"]`,
        )
        .first(),
    ).toBeVisible()
    await activateViewer(page, region)
    await region.screenshot({
      path: testInfo.outputPath(`${preset || "default"}-schematic.png`),
    })

    await region.getByRole("button", { name: "3D", exact: true }).click()
    await expect.poll(() => glbRequests.has(glb.package_file_id)).toBe(true)
    await expect(region.locator("canvas:visible").last()).toBeVisible()
    await activateViewer(page, region)
    const bounds = await region.locator("canvas:visible").last().boundingBox()
    if (!bounds) throw new Error("3D canvas has no bounds")
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(
      bounds.x + bounds.width / 2 + 35,
      bounds.y + bounds.height / 2 + 20,
      { steps: 6 },
    )
    await page.mouse.up()
    await region.screenshot({
      path: testInfo.outputPath(`${preset || "default"}-3d.png`),
    })
  }

  const release = new URL(page.url()).searchParams.get("reference_release")
  await page.reload()
  await expect(picker).toHaveText("Without LED")
  await expect(
    region.getByRole("button", { name: "3D", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await expect(region.locator("canvas:visible").last()).toBeVisible()
  expect(new URL(page.url()).searchParams.get("reference_release")).toBe(
    release,
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await region.scrollIntoViewIfNeeded()
  await expect(picker).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await region.screenshot({ path: testInfo.outputPath("mobile-inline.png") })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await region.getByRole("link", { name: "Open package", exact: true }).click()
  await expect(page).toHaveURL(
    /\/ShiboSoftwareDev\/ne555-timer-presets\?.*#3d$/,
  )
  expect(new URL(page.url()).searchParams.get("package_release_id")).toBe(
    release,
  )
  expect(new URL(page.url()).searchParams.get("preview_file")).toBe(
    "dist/index/without_led/circuit.json",
  )
  await expect(page.getByRole("combobox", { name: "Preview file" })).toHaveText(
    "4 Builds",
  )
  await expect(page.locator("canvas:visible").last()).toBeVisible()
  expect(errors).toEqual([])
})
