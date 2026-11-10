import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import type { AnyCircuitElement } from "circuit-json"
import type { PreviewParameterManifest } from "../src/lib/package-preview-parameters"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to a real deployment",
)

test("a cold package link restores combined parameters and exports the exact circuit", async ({
  page,
}, info) => {
  test.setTimeout(180_000)
  const release =
    process.env.TSCIRCUIT_PARAMETER_RELEASE ||
    "e68c98ee-6946-4d75-9fba-e3ca545d412f"
  await page.goto("/")
  const path = await page.evaluate(async (release) => {
    const response = await fetch(
      `https://registry-api.tscircuit.com/package_files/get?package_release_id=${release}&file_path=dist%2Fpreview.json`,
    )
    const manifest: PreviewParameterManifest = JSON.parse(
      (await response.json()).package_file.content_text,
    )
    const selected = manifest.variants.find(
      (v) =>
        v.values.externalLfCrystal === false &&
        v.values.debugHeader === false &&
        v.values.supplyVoltage === 3.3 &&
        v.values.inputBulkCapacitance === "22uF" &&
        v.values.resetPullupResistance === "10k",
    )
    if (!selected)
      throw new Error("The build is missing the requested combined state")
    return selected.circuitJsonPath
  }, release)
  const query = new URLSearchParams({
    package_release_id: release,
    preview_file: path,
  })
  await page.goto(
    `/ShiboSoftwareDev/cc2340r5-reference-design?${query}#schematic`,
  )
  await page
    .getByRole("button", { name: "Parameters", exact: true })
    .click({ timeout: 120_000 })
  const panel = page.getByRole("complementary", { name: "Circuit parameters" })
  await expect(panel.getByRole("switch", { name: "SWD header" })).toBeEnabled({
    timeout: 120_000,
  })
  await expect(
    panel.getByRole("switch", { name: "SWD header" }),
  ).not.toBeChecked()
  await expect(
    panel.getByRole("switch", { name: "External LF crystal" }),
  ).not.toBeChecked()
  for (const [label, value] of [
    ["Supply voltage", "3.3 V"],
    ["Input bulk capacitor", "22 µF"],
    ["Reset pull-up", "10 kΩ"],
  ])
    await expect(
      panel.getByLabel(`${label} value`, { exact: true }),
    ).toHaveText(value)
  await page.keyboard.press("Escape")
  const schematic = page
    .locator("svg:has([data-schematic-component-id])")
    .last()
  await expect(schematic).toContainText(/C2\s*22\s*[µμu]F/)
  await expect(schematic).toContainText(/R14\s*10\s*k/)
  await expect(schematic).toContainText("3.3 V supply")
  await page.getByRole("button", { name: "Download", exact: true }).click()
  const pending = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: /Circuit JSON/ }).click()
  const download = await pending
  const output = info.outputPath("combined-circuit.json")
  await download.saveAs(output)
  const circuit: AnyCircuitElement[] = JSON.parse(
    await readFile(output, "utf8"),
  )
  const parts = circuit.filter((e) => e.type === "source_component")
  expect(parts).toHaveLength(23)
  const capacitor = parts.find((element) => element.name === "C2")
  const resistor = parts.find((element) => element.name === "R14")
  if (
    !capacitor ||
    !("capacitance" in capacitor) ||
    !resistor ||
    !("resistance" in resistor)
  )
    throw new Error("Missing configured support components")
  expect(capacitor.capacitance).toBe(22e-6)
  expect(resistor.resistance).toBe(10e3)
  expect(parts.some((e) => ["Y1", "C14", "C15", "J4"].includes(e.name))).toBe(
    false,
  )
  expect(circuit.filter((e) => e.type.endsWith("_error"))).toEqual([])
  expect(JSON.stringify(circuit)).toContain("3.3 V supply")
  expect(
    circuit.some(
      (element) =>
        element.type === "schematic_path" &&
        element.schematic_path_id?.startsWith("preview_removed_"),
    ),
  ).toBe(false)
})
