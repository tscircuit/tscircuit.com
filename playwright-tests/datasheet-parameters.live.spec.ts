import { expect, test, type Request, type Response } from "@playwright/test"
import { gunzipSync } from "node:zlib"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)
const release =
  process.env.TSCIRCUIT_PARAMETER_RELEASE ||
  "3c0e9272-49aa-486b-b269-1e4b0b218b40"
test("independent controls compose all 64 exact states offline and preserve the viewers", async ({
  page,
  context,
}, info) => {
  test.setTimeout(600_000)
  await page.addInitScript(() =>
    localStorage.setItem("cadViewerAutoRotate", "false"),
  )
  const errors: string[] = []
  const requests: string[] = []
  const downloads = new Map<string, Response>()
  let monitor = false
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("request", (request) => {
    if (monitor && request.url().includes("registry-api.tscircuit.com"))
      requests.push(request.url())
  })
  page.on("response", (response) => {
    if (!response.ok()) return
    for (
      let request: Request | null = response.request();
      request;
      request = request.redirectedFrom()
    ) {
      const url = new URL(request.url())
      if (
        url.pathname.endsWith("/package_files/download") ||
        url.origin === "https://usercontent.tscircuit.com"
      ) {
        const id = url.searchParams.get("package_file_id")
        if (id) {
          downloads.set(id, response)
          break
        }
      }
    }
  })
  const list = page.waitForResponse(
    (r) => r.ok() && r.url().includes("/package_files/list?"),
  )
  await page.goto(
    `/datasheets/CC2340R52E0RGER?reference_release=${release}&reference_view=3d#reference-designs`,
    { timeout: 60_000 },
  )
  const { package_files: files } = await (await list).json()
  const manifestFile = files.find(
    (f: any) => f.file_path === "dist/preview.json",
  )
  expect(manifestFile).toBeTruthy()
  const manifest = await page.evaluate(async (id) => {
    const r = await fetch(
      `https://registry-api.tscircuit.com/package_files/get?package_file_id=${id}`,
    )
    return JSON.parse((await r.json()).package_file.content_text)
  }, manifestFile.package_file_id)
  expect(manifest.variants).toHaveLength(64)
  expect(new Set(manifest.variants.map((v: any) => v.glbPath)).size).toBe(8)
  const bundleId = files.find(
    (f: any) => f.file_path === manifest.bundlePath,
  ).package_file_id
  const region = page.getByRole("region", { name: "Reference designs" })
  const panel = region.getByRole("complementary", {
    name: "Circuit parameters",
  })
  await panel.scrollIntoViewIfNeeded()
  const lf = panel.getByRole("switch", { name: "External LF crystal" })
  const header = panel.getByRole("switch", { name: "SWD header" })
  const displayValue = (name: string) =>
    panel.getByLabel(`${name} value`, { exact: true })
  const range = (name: string) =>
    panel.getByRole("slider", { name: `${name} slider` })
  await expect(lf).toBeEnabled({ timeout: 120_000 })
  await expect
    .poll(() => downloads.has(bundleId), { timeout: 30_000 })
    .toBe(true)
  const bytes = await downloads.get(bundleId)!.body()
  const bundle: Record<string, any[]> = JSON.parse(
    (bytes[0] === 0x1f ? gunzipSync(bytes) : bytes).toString(),
  )
  await expect(lf).toBeChecked()
  await expect(header).toBeChecked()
  await expect(panel.getByRole("spinbutton")).toHaveCount(0)
  for (const parameter of manifest.parameters)
    if (parameter.description)
      await expect(
        panel.getByText(parameter.description, { exact: true }),
      ).toHaveCount(0)
  await expect(displayValue("Supply voltage")).toHaveText("2.5 V")
  const canvas = region.locator("canvas:visible").last()
  await expect(canvas).toBeVisible()
  await canvas.evaluate((e) => e.setAttribute("data-parameter-canvas", "true"))
  await page.evaluate(() => {
    const region = document.querySelector("#reference-designs")!
    const scene = region.querySelector("[data-parameter-canvas]")!
    ;(window as any).parameterFailures = []
    const check = () => {
      if (!scene.isConnected)
        (window as any).parameterFailures.push("scene unmounted")
      for (const e of region.querySelectorAll("div,p"))
        if (
          !e.children.length &&
          /^Loading (reference design|3D view|PCB view|schematic view)/.test(
            e.textContent?.trim() || "",
          ) &&
          e.checkVisibility()
        )
          (window as any).parameterFailures.push("visible loader")
      ;(window as any).parameterFrame = requestAnimationFrame(check)
    }
    check()
  })
  await context.setOffline(true)
  monitor = true
  // Real slider keyboard interaction, composing the previously unavailable state.
  await lf.uncheck()
  await header.uncheck()
  await range("Supply voltage").press("End")
  await range("Input bulk capacitor").press("End")
  await range("Reset pull-up").press("Home")
  await expect(displayValue("Supply voltage")).toHaveText("3.3 V")
  await expect(displayValue("Input bulk capacitor")).toHaveText("22 µF")
  await expect(displayValue("Reset pull-up")).toHaveText("10 kΩ")
  await expect(
    region.locator('canvas[data-parameter-canvas="true"]'),
  ).toBeVisible()
  await region.getByRole("button", { name: "Schematic", exact: true }).click()
  const schematic = region
    .locator("svg:has([data-schematic-component-id])")
    .last()
  await expect(schematic).toContainText(/C2\s*22\s*[µμu]F/)
  await expect(schematic).toContainText(/R14\s*10\s*k/)
  await expect(schematic).toContainText("3.3 V supply")
  await region.screenshot({
    path: info.outputPath("combined-parameters-schematic.png"),
  })
  const setSlider = async (name: string, value: number) => {
    const parameter = manifest.parameters.find((p: any) => p.label === name)
    const target = parameter.options.findIndex((o: any) => o.number === value)
    expect(target).toBeGreaterThanOrEqual(0)
    const current = Number(await range(name).inputValue())
    for (let step = 0; step < Math.abs(target - current); step++)
      await range(name).press(target > current ? "ArrowRight" : "ArrowLeft")
    await expect(range(name)).toHaveValue(String(target))
  }
  // All exact combinations, with each field preserving every other setting.
  let checked = 0
  for (const ext of [true, false])
    for (const debug of [true, false])
      for (const cap of [10, 22])
        for (const voltage of [1.8, 2.5, 3, 3.3])
          for (const resistance of [100, 10]) {
            await lf.setChecked(ext)
            await header.setChecked(debug)
            await setSlider("Input bulk capacitor", cap)
            await setSlider("Supply voltage", voltage)
            await setSlider("Reset pull-up", resistance)
            const values = {
              externalLfCrystal: ext,
              debugHeader: debug,
              supplyVoltage: voltage,
              inputBulkCapacitance: `${cap}uF`,
              resetPullupResistance: `${resistance}k`,
            }
            const variant = manifest.variants.find((v: any) =>
              Object.entries(values).every(
                ([key, value]) => v.values[key] === value,
              ),
            )
            expect(variant).toBeTruthy()
            await expect
              .poll(() =>
                new URL(page.url()).searchParams.get("reference_file"),
              )
              .toBe(variant.circuitJsonPath)
            const circuit = bundle[variant.circuitJsonPath]
            const parts = circuit.filter(
              (e: any) => e.type === "source_component",
            )
            expect(parts).toHaveLength(23 + (ext ? 3 : 0) + (debug ? 1 : 0))
            expect(
              parts.find((e: any) => e.name === "C2").capacitance,
            ).toBeCloseTo(cap * 1e-6, 12)
            expect(parts.find((e: any) => e.name === "R14").resistance).toBe(
              resistance * 1000,
            )
            await expect(schematic).toContainText(
              new RegExp(`C2\\s*${cap}\\s*[µμu]F`),
            )
            await expect(schematic).toContainText(
              new RegExp(`R14\\s*${resistance}\\s*k`),
            )
            await expect(schematic).toContainText(
              `${voltage.toFixed(1)} V supply`,
            )
            await expect
              .poll(() =>
                region
                  .locator("[data-schematic-component-id]")
                  .evaluateAll(
                    (es) =>
                      new Set(
                        es.map((e) =>
                          e.getAttribute("data-schematic-component-id"),
                        ),
                      ).size,
                  ),
              )
              .toBe(parts.length)
            checked++
            if (checked % 16 === 0)
              console.info(`Verified ${checked}/64 parameter states offline`)
          }
  expect(checked).toBe(64)
  await expect(region.getByText(/omitted/i)).toHaveCount(0)
  await region.getByRole("button", { name: "PCB", exact: true }).click()
  await expect(region.getByRole("alert")).toHaveCount(0)
  const pcbCanvas = region.locator("canvas:visible")
  await expect(pcbCanvas.first()).toBeVisible()
  await expect
    .poll(() =>
      pcbCanvas.evaluateAll((elements) =>
        Math.max(
          0,
          ...elements.map((element) => {
            const canvas = element as HTMLCanvasElement
            const context = canvas.getContext("2d")
            if (!context) return 0
            const data = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data
            let copperPixels = 0
            for (let i = 0; i < data.length; i += 64)
              if (
                data[i + 3] > 0 &&
                data[i] > 100 &&
                data[i] > data[i + 1] + 40 &&
                data[i] > data[i + 2] + 40
              )
                copperPixels++
            return copperPixels
          }),
        ),
      ),
    )
    .toBeGreaterThan(100)
  await region.screenshot({
    path: info.outputPath("combined-parameters-pcb.png"),
  })
  await region.getByRole("button", { name: "3D", exact: true }).click()
  await expect(
    region.locator('canvas[data-parameter-canvas="true"]'),
  ).toBeVisible()
  await expect(
    region
      .getByRole("status", { includeHidden: true })
      .filter({ hasText: "Loading 3D view" }),
  ).toHaveCount(0)
  await region.screenshot({
    path: info.outputPath("combined-parameters-3d.png"),
  })
  expect(await page.evaluate(() => (window as any).parameterFailures)).toEqual(
    [],
  )
  expect(requests).toEqual([])
  monitor = false
  await context.setOffline(false)
  await page.reload()
  await expect(lf).toBeEnabled({ timeout: 120_000 })
  await expect(lf).not.toBeChecked()
  await expect(header).not.toBeChecked()
  await expect(displayValue("Supply voltage")).toHaveText("3.3 V")
  await expect(displayValue("Input bulk capacitor")).toHaveText("22 µF")
  await expect(displayValue("Reset pull-up")).toHaveText("10 kΩ")
  await panel.getByRole("button", { name: "Reset to defaults" }).click()
  await expect(lf).toBeChecked()
  await expect(header).toBeChecked()
  await expect(displayValue("Input bulk capacitor")).toHaveText("10 µF")
  await expect(displayValue("Supply voltage")).toHaveText("2.5 V")
  await page.setViewportSize({ width: 390, height: 844 })
  await panel.scrollIntoViewIfNeeded()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await region.screenshot({ path: info.outputPath("mobile-parameters.png") })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await region.getByRole("link", { name: "Open package", exact: true }).click()
  await page.getByRole("button", { name: "Parameters", exact: true }).click()
  const popup = page.getByRole("complementary", { name: "Circuit parameters" })
  await expect(popup.getByRole("switch", { name: "SWD header" })).toBeEnabled({
    timeout: 120_000,
  })
  await popup.getByRole("switch", { name: "SWD header" }).uncheck()
  await expect(
    popup.getByRole("switch", { name: "External LF crystal" }),
  ).toBeChecked()
  expect(errors).toEqual([])
})
