import { expect, test } from "@playwright/test"
import { readFile } from "node:fs/promises"

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
    "3c0e9272-49aa-486b-b269-1e4b0b218b40"
  await page.goto("/")
  const path = await page.evaluate(async (release) => {
    const response = await fetch(
      `https://registry-api.tscircuit.com/package_files/get?package_release_id=${release}&file_path=dist%2Fpreview.json`,
    )
    const manifest = JSON.parse(
      (await response.json()).package_file.content_text,
    )
    const selected = manifest.variants.find(
      (v: any) =>
        v.values.externalLfCrystal === false &&
        v.values.debugHeader === false &&
        v.values.supplyVoltage === 3.3 &&
        v.values.inputBulkCapacitance === "22uF" &&
        v.values.resetPullupResistance === "10k",
    )
    if (!selected)
      throw new Error("The build is missing the requested combined state")
    return selected.circuitJsonPath as string
  }, release)
  const query = new URLSearchParams({
    package_release_id: release,
    preview_file: path,
  })
  await page.goto(
    `/ShiboSoftwareDev/cc2340r5-reference-design?${query}#schematic`,
  )
  await page.getByRole("button", { name: "Parameters", exact: true }).click()
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
  const circuit = JSON.parse(await readFile(output, "utf8"))
  const parts = circuit.filter((e: any) => e.type === "source_component")
  expect(parts).toHaveLength(23)
  expect(parts.find((e: any) => e.name === "C2").capacitance).toBe(22e-6)
  expect(parts.find((e: any) => e.name === "R14").resistance).toBe(10e3)
  expect(
    parts.some((e: any) => ["Y1", "C14", "C15", "J4"].includes(e.name)),
  ).toBe(false)
  expect(circuit.filter((e: any) => e.type.endsWith("_error"))).toEqual([])
  expect(JSON.stringify(circuit)).toContain("3.3 V supply")
})
