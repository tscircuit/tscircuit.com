import {
  expect,
  test,
  type Locator,
  type Page,
  type Request,
} from "@playwright/test"

import {
  cc2340Configurations,
  cc2340Release,
} from "./cc2340-reference-configurations"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)

async function activate(page: Page, region: Locator) {
  const overlay = region
    .getByText("Click to Interact", { exact: true })
    .filter({ visible: true })
    .first()
  if (!(await overlay.isVisible())) return
  const bounds = await overlay.boundingBox()
  if (!bounds) throw new Error("Viewer activation overlay has no bounds")
  await page.mouse.click(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  )
  await expect(overlay).not.toBeVisible()
}

test("CC2340 postbuild configurations render inline from their published package", async ({
  page,
}, testInfo) => {
  test.setTimeout(360_000)
  const errors: string[] = []
  const downloads = new Set<string>()
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("response", (response) => {
    if (!response.ok()) return
    for (
      let request: Request | null = response.request();
      request;
      request = request.redirectedFrom()
    ) {
      const url = new URL(request.url())
      if (url.pathname.endsWith("/package_files/download")) {
        downloads.add(url.searchParams.get("package_file_id")!)
        break
      }
    }
  })

  const listResponse = page.waitForResponse(
    (response) =>
      response.ok() && response.url().includes("/package_files/list?"),
    { timeout: 60_000 },
  )
  await page.goto(
    `/datasheets/CC2340R52E0RGER?reference_release=${cc2340Release}&reference_view=schematic#reference-designs`,
    { timeout: 60_000 },
  )
  const region = page.getByRole("region", { name: "Reference designs" })
  await region.scrollIntoViewIfNeeded()
  const picker = region.getByRole("combobox", { name: "Configuration" })
  await expect(picker).toBeVisible()
  const { package_files: files } = await (await listResponse).json()
  for (const config of cc2340Configurations) {
    const { preset, label, count } = config
    const prefix = `dist/index/${preset ? preset + "/" : ""}`
    const file = files.find(
      (item: any) => item.file_path === `${prefix}circuit.json`,
    )
    const glb = files.find((item: any) => item.file_path === `${prefix}3d.glb`)
    expect(file).toBeTruthy()
    expect(glb).toBeTruthy()
    await picker.click()
    await page.getByRole("option", { name: label, exact: true }).click()
    await expect(picker).toHaveText(label)
    await expect(page).toHaveURL(
      new RegExp(
        `reference_file=${encodeURIComponent(prefix + "circuit.json")}`,
      ),
    )
    const circuit = await page.evaluate(async (id) => {
      const response = await fetch(
        `https://registry-api.tscircuit.com/package_files/get?package_file_id=${id}`,
      )
      if (!response.ok) throw new Error("Published circuit download failed")
      return JSON.parse((await response.json()).package_file.content_text)
    }, file.package_file_id)
    const parts = circuit.filter(
      (item: any) => item.type === "source_component",
    )
    expect(parts).toHaveLength(count)
    expect(parts.find((part: any) => part.name === "C2").capacitance).toBe(
      config.bulk,
    )
    expect(parts.find((part: any) => part.name === "R14").resistance).toBe(
      config.reset,
    )
    expect(JSON.stringify(circuit)).not.toMatch(/omitted/i)
    expect(
      parts.find((item: any) => item.name === "U1").manufacturer_part_number,
    ).toBe("CC2340R52E0RGER")
    expect(parts.some((item: any) => item.name === "Y1")).toBe(config.lf)
    expect(parts.some((item: any) => item.name === "J4")).toBe(config.header)
    expect(
      parts.some((item: any) =>
        /BQ25150|BQ27427|BMA400|TPS7A02/.test(
          item.manufacturer_part_number || "",
        ),
      ),
    ).toBe(false)
    expect(circuit.filter((item: any) => item.type.endsWith("_error"))).toEqual(
      [],
    )
    expect(circuit.some((item: any) => item.type === "pcb_trace")).toBe(true)
    for (const view of ["Schematic", "PCB", "3D"] as const) {
      await region.getByRole("button", { name: view, exact: true }).click()
      if (view === "Schematic")
        await expect(
          region
            .locator('[data-schematic-component-id="schematic_component_0"]')
            .first(),
        ).toBeVisible()
      else await expect(region.locator("canvas:visible").last()).toBeVisible()
      if (view === "3D")
        await expect.poll(() => downloads.has(glb.package_file_id)).toBe(true)
      await activate(page, region)
      await region.screenshot({
        path: testInfo.outputPath(
          `${preset || "default"}-${view.toLowerCase()}.png`,
        ),
      })
    }
    expect(new URL(page.url()).pathname).toBe("/datasheets/CC2340R52E0RGER")
  }
  const release = new URL(page.url()).searchParams.get("reference_release")
  expect(release).toBeTruthy()
  await page.reload()
  await expect(picker).toHaveText("Minimal")
  expect(new URL(page.url()).searchParams.get("reference_release")).toBe(
    release,
  )
  await expect(region.locator("canvas:visible").last()).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await region.scrollIntoViewIfNeeded()
  await expect(picker).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await region.screenshot({ path: testInfo.outputPath("mobile.png") })
  await page.setViewportSize({ width: 1440, height: 1000 })
  const datasheetUrl = page.url()
  const newTab = page.waitForEvent("popup")
  await region.getByRole("link", { name: "Open package", exact: true }).click()
  const packagePage = await newTab
  await expect(packagePage).toHaveURL(
    /\/ShiboSoftwareDev\/cc2340r5-reference-design\?.*#3d$/,
  )
  expect(new URL(packagePage.url()).searchParams.get("preview_file")).toBe(
    "dist/index/minimal/circuit.json",
  )
  expect(
    new URL(packagePage.url()).searchParams.get("package_release_id"),
  ).toBe(release)
  await expect(
    packagePage.getByRole("combobox", { name: "Preview file" }),
  ).toHaveText(`${cc2340Configurations.length} Builds`)
  await expect(packagePage.locator("canvas:visible").last()).toBeVisible()
  expect(page.url()).toBe(datasheetUrl)
  await packagePage.close()
  expect(errors).toEqual([])
})
