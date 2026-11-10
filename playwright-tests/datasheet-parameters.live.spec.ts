import { gunzipSync } from "node:zlib"
import { type Request, type Response, expect, test } from "@playwright/test"
import type { AnyCircuitElement } from "circuit-json"
import {
  parsePreviewParameterManifest,
  previewParameterManifestSchema,
} from "../src/lib/package-preview-parameters"

type PackageFileId = string
type PackageFile = { package_file_id: PackageFileId; file_path: string }

declare global {
  interface Window {
    parameterFailures: string[]
    parameterFrame: number
  }
}

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)
const release =
  process.env.TSCIRCUIT_PARAMETER_RELEASE ||
  "e68c98ee-6946-4d75-9fba-e3ca545d412f"
test("independent controls compose all 64 exact states offline and preserve the viewers", async ({
  page,
  context,
}, info) => {
  test.setTimeout(900_000)
  await page.addInitScript(() =>
    localStorage.setItem("cadViewerAutoRotate", "false"),
  )
  const errors: string[] = []
  const requests: string[] = []
  const downloads = new Map<PackageFileId, Response>()
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
    { timeout: 60_000 },
  )
  await page.goto(
    `/datasheets/CC2340R52E0RGER/reference-designs/ShiboSoftwareDev/cc2340r5-reference-design?package_release_id=${release}#3d`,
    { timeout: 60_000 },
  )
  const { package_files: files }: { package_files: PackageFile[] } = await (
    await list
  ).json()
  const manifestFile = files.find((f) => f.file_path === "dist/preview.json")
  if (!manifestFile) throw new Error("Missing published preview manifest")
  const publishedManifest = await page.evaluate(async (id) => {
    const r = await fetch(
      `https://registry-api.tscircuit.com/package_files/get?package_file_id=${id}`,
    )
    return JSON.parse((await r.json()).package_file.content_text)
  }, manifestFile.package_file_id)
  const rawManifest = previewParameterManifestSchema.parse(publishedManifest)
  const schemaFile = files.find(
    (f) =>
      rawManifest.version === 2 && f.file_path === rawManifest.propsSchemaPath,
  )
  const schema = schemaFile
    ? await page.evaluate(async (id) => {
        const response = await fetch(
          `https://registry-api.tscircuit.com/package_files/get?package_file_id=${id}`,
        )
        return JSON.parse((await response.json()).package_file.content_text)
      }, schemaFile.package_file_id)
    : undefined
  const manifest = parsePreviewParameterManifest({
    manifest: rawManifest,
    files: files,
    propsSchema: schema,
  })
  expect(manifest.variants).toHaveLength(64)
  expect(new Set(manifest.variants.map((v) => v.glbPath)).size).toBe(8)
  const bundleFile = files.find((f) => f.file_path === manifest.bundlePath)
  if (!bundleFile) throw new Error("Missing published circuit bundle")
  const bundleId = bundleFile.package_file_id
  const region = page.getByRole("region", {
    name: "Reference design",
    exact: true,
  })
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
  const bundle: Record<string, AnyCircuitElement[]> = JSON.parse(
    (bytes[0] === 0x1f ? gunzipSync(bytes) : bytes).toString(),
  )
  await expect(lf).toBeChecked()
  await expect(header).toBeChecked()
  await expect(panel.getByRole("spinbutton")).toHaveCount(0)
  await expect(displayValue("Supply voltage")).toHaveText("2.5 V")
  const canvas = region.locator("canvas:visible").last()
  await expect(canvas).toBeVisible()
  await canvas.evaluate((e) => e.setAttribute("data-parameter-canvas", "true"))
  await page.evaluate(() => {
    const region = document.querySelector(
      '[aria-labelledby="reference-design-heading"]',
    )!
    const scene = region.querySelector("[data-parameter-canvas]")!
    window.parameterFailures = []
    const check = () => {
      if (!scene.isConnected) window.parameterFailures.push("scene unmounted")
      for (const e of region.querySelectorAll("div,p"))
        if (
          !e.children.length &&
          /^Loading (reference design|3D view|PCB view|schematic view)/.test(
            e.textContent?.trim() || "",
          ) &&
          e.checkVisibility()
        )
          window.parameterFailures.push("visible loader")
      window.parameterFrame = requestAnimationFrame(check)
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
    region.getByRole("status", { name: "Configuration changes" }),
  ).toContainText("R14")
  await region.getByRole("button", { name: "Schematic", exact: true }).click()
  const schematic = region
    .locator("svg:has([data-schematic-component-id])")
    .last()
  await expect(schematic).toContainText(/C2\s*22\s*[µμu]F/)
  await expect(schematic).toContainText(/R14\s*10\s*k/)
  await expect(schematic).toContainText("3.3 V supply")
  const changedResistor = schematic
    .locator("g[data-schematic-component-id]")
    .filter({ has: page.getByText("R14", { exact: true }) })
  await expect
    .poll(() =>
      changedResistor
        .locator(".sch-component-text")
        .last()
        .evaluate((element) => getComputedStyle(element).fill),
    )
    .toBe("rgb(217, 119, 6)")
  await expect(
    panel.getByLabel("Reset pull-up previous value", { exact: true }),
  ).toContainText("100")

  await region.screenshot({
    path: info.outputPath("combined-parameters-schematic.png"),
  })
  const setSlider = async (name: string, value: number) => {
    const parameter = manifest.parameters.find((p) => p.label === name)
    if (!parameter || parameter.type !== "number")
      throw new Error(`Missing numeric parameter ${name}`)
    const target = parameter.options.findIndex((o) => o.number === value)
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
            const variant = manifest.variants.find((v) =>
              Object.entries(values).every(
                ([key, value]) => v.values[key] === value,
              ),
            )
            if (!variant)
              throw new Error("Missing published parameter combination")
            await expect
              .poll(() => new URL(page.url()).searchParams.get("preview_file"))
              .toBe(variant.circuitJsonPath)
            const circuit = bundle[variant.circuitJsonPath]
            const parts = circuit.filter((e) => e.type === "source_component")
            expect(parts).toHaveLength(23 + (ext ? 3 : 0) + (debug ? 1 : 0))
            const capacitor = parts.find((element) => element.name === "C2")
            const resistor = parts.find((element) => element.name === "R14")
            if (
              !capacitor ||
              !("capacitance" in capacitor) ||
              !resistor ||
              !("resistance" in resistor)
            )
              throw new Error("Missing configured support components")
            expect(capacitor.capacitance).toBeCloseTo(cap * 1e-6, 12)
            expect(resistor.resistance).toBe(resistance * 1000)
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
  expect(await page.evaluate(() => window.parameterFailures)).toEqual([])
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
  const datasheetUrl = page.url()
  const newTab = page.waitForEvent("popup")
  await region.getByRole("link", { name: "Open package", exact: true }).click()
  const packagePage = await newTab
  packagePage.on("pageerror", (e) => errors.push(e.message))
  await expect(packagePage).toHaveURL(
    /\/ShiboSoftwareDev\/cc2340r5-reference-design\?.*#3d$/,
  )
  expect(page.url()).toBe(datasheetUrl)
  await expect(panel).toBeVisible()
  await packagePage
    .getByRole("button", { name: "Parameters", exact: true })
    .click({ timeout: 120_000 })
  const popup = packagePage.getByRole("complementary", {
    name: "Circuit parameters",
  })
  await expect(popup.getByRole("switch", { name: "SWD header" })).toBeEnabled({
    timeout: 120_000,
  })
  await popup.getByRole("switch", { name: "SWD header" }).uncheck()
  await expect(
    popup.getByRole("switch", { name: "External LF crystal" }),
  ).toBeChecked()
  await packagePage.close()
  await page.goto(
    `/datasheets/CC2340R52E0RGER/reference-designs/ShiboSoftwareDev/cc2340r5-reference-design?package_release_id=${release}#schematic`,
  )
  await expect(
    region.getByRole("button", { name: "Schematic", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await expect(lf).toBeEnabled({ timeout: 120_000 })
  await region.screenshot({
    path: info.outputPath("default-reference-design.png"),
  })
  expect(errors).toEqual([])
})
