import { expect, test, type Page } from "@playwright/test"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)

const packageName = "ShiboSoftwareDev/ne555-timer-presets"
const presets = ["", "full_board", "slow", "without_led"]
const picker = (page: Page) =>
  page.getByRole("combobox", { name: "Preview file" })

async function interactWithViewer(page: Page) {
  const overlay = page.getByText("Click to Interact", { exact: true })
  if (await overlay.isVisible()) {
    const bounds = await overlay.boundingBox()
    if (!bounds) throw new Error("Viewer interaction overlay has no bounds")
    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    )
    await expect(overlay).not.toBeVisible()
  }
}

test("datasheet opens the real package and all four cloud-built circuits render in its ordinary views", async ({
  page,
}, testInfo) => {
  const pageErrors: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))
  await page.goto("/datasheets/NE555DR")
  await expect(
    page.getByRole("heading", { name: "NE555DR Datasheet", exact: true }),
  ).toBeVisible()
  const references = page.getByRole("region", { name: "Reference designs" })
  await references.scrollIntoViewIfNeeded()
  await expect(
    references.getByRole("link", { name: packageName, exact: true }),
  ).toBeVisible()
  await expect(
    references.getByText(
      "NE555DR astable timer with prebuilt timing and LED options.",
    ),
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath("datasheet.png"),
    fullPage: true,
  })

  const listResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/package_files/list?") &&
      response.status() === 200,
  )
  await references
    .getByRole("link", { name: "Open package", exact: true })
    .click()
  await expect(page).toHaveURL(new RegExp(`/${packageName}#pcb$`))
  const { package_files: files } = await (await listResponse).json()
  await expect(picker(page)).toHaveText("4 Builds")

  for (const preset of presets) {
    await page.getByRole("button", { name: "PCB", exact: true }).click()
    const prefix = `dist/index/${preset ? `${preset}/` : ""}`
    const path = `${prefix}circuit.json`
    const circuitFile = files.find((file: any) => file.file_path === path)
    const glbFile = files.find(
      (file: any) => file.file_path === `${prefix}3d.glb`,
    )
    expect(circuitFile).toBeTruthy()
    expect(glbFile).toBeTruthy()
    await picker(page).click()
    const circuitResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/package_files/get?") &&
        new URL(response.url()).searchParams.get("package_file_id") ===
          circuitFile.package_file_id,
    )
    await page
      .getByRole("option", { name: path.replace(/^dist\//, ""), exact: true })
      .click()
    const { package_file: file } = await (await circuitResponse).json()
    const circuit = JSON.parse(file.content_text)
    const timingCap = circuit.find(
      (element: any) =>
        element.type === "source_component" && element.name === "C1",
    )
    expect(timingCap.capacitance).toBeCloseTo(
      preset === "slow" ? 100e-6 : 10e-6,
      9,
    )
    expect(
      circuit.some(
        (element: any) =>
          element.type === "source_component" && element.name === "D1",
      ),
    ).toBe(preset !== "without_led")
    expect(new URL(page.url()).searchParams.get("preview_file")).toBe(path)

    await page.getByRole("button", { name: "PCB", exact: true }).click()
    await expect(
      page.getByText("Loading PCB view...", { exact: true }),
    ).toHaveCount(0)
    await expect(page.locator("canvas:visible").first()).toBeVisible()
    await interactWithViewer(page)
    await page.screenshot({
      path: testInfo.outputPath(`${preset || "default"}-pcb.png`),
    })

    await page.getByRole("button", { name: "Schematic", exact: true }).click()
    const capSymbol = circuit.find(
      (element: any) =>
        element.type === "schematic_component" &&
        element.source_component_id === timingCap.source_component_id,
    )
    await expect(
      page
        .locator(
          `[data-schematic-component-id="${capSymbol.schematic_component_id}"]`,
        )
        .first(),
    ).toBeVisible()
    await interactWithViewer(page)
    await page.screenshot({
      path: testInfo.outputPath(`${preset || "default"}-schematic.png`),
    })

    const glbResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/package_files/download?") &&
        new URL(response.url()).searchParams.get("package_file_id") ===
          glbFile.package_file_id,
    )
    await page.getByRole("button", { name: "3D", exact: true }).click()
    expect((await glbResponse).status()).toBeLessThan(400)
    await expect(
      page.getByText("Loading 3D view...", { exact: true }),
    ).toHaveCount(0)
    await expect(page.locator("canvas:visible").last()).toBeVisible()
    await interactWithViewer(page)
    const bounds = await page.locator("canvas:visible").last().boundingBox()
    if (!bounds) throw new Error("3D viewer has no bounds")
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    }
    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    await page.mouse.move(center.x + 50, center.y + 25, { steps: 8 })
    await page.mouse.up()
    await page.screenshot({
      path: testInfo.outputPath(`${preset || "default"}-3d.png`),
    })
  }

  await page.reload()
  await expect(picker(page)).toHaveText("4 Builds")
  expect(new URL(page.url()).searchParams.get("preview_file")).toBe(
    "dist/index/without_led/circuit.json",
  )
  await expect(page.locator("canvas:visible").last()).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(picker(page)).toBeVisible()
  await picker(page).click()
  await expect(
    page.getByRole("option", { name: "index/slow/circuit.json", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("option", { name: "index/slow/circuit.json", exact: true })
    .click()
  await expect(page.locator("canvas:visible").last()).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("mobile.png") })
  expect(pageErrors).toEqual([])
})
