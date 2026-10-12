import { expect, test } from "@playwright/test"
import type { CircuitJson } from "circuit-json"
import { readFile } from "node:fs/promises"
import { exampleCircuitJson } from "./exampleCircuitJson"

const printedParts: CircuitJson = ["BASE", "COVER"].flatMap(
  (name, index): CircuitJson => [
    {
      type: "source_component",
      source_component_id: name,
      ftype: "printedpart",
      name,
    },
    {
      type: "cad_component",
      cad_component_id: `${name}_cad`,
      source_component_id: name,
      position: { x: index * 4, y: 0, z: 0 },
      model_jscad: { type: "cuboid", size: [4, 6, 2] },
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    },
  ],
)

for (const includePcb of [false, true]) {
  test(`downloads printed parts as an assembly ${includePcb ? "with" : "without"} a PCB`, async ({
    page,
  }) => {
    await page.route(
      "**/package_releases/get_preview_circuit_json?*",
      (route) =>
        route.fulfill({
          json: {
            preview_circuit_json_response: {
              circuit_json_found: true,
              circuit_json: [
                ...printedParts,
                ...(includePcb ? exampleCircuitJson : []),
              ],
            },
          },
        }),
    )
    await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
    await page.getByRole("button", { name: "Download", exact: true }).click()
    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("menuitem", { name: "Assembly STEP" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("my-test-board-assembly.step")
    const step = await readFile((await download.path())!, "utf8")
    expect(step).toContain("ISO-10303-21;")
    expect(step).toContain("'Combined Assembly'")
    expect(step).toContain("'BASE'")
    expect(step).toContain("'COVER'")
    expect(step.match(/= PRODUCT\(/g)).toHaveLength(3)
    expect(step.match(/= MANIFOLD_SOLID_BREP\(/g)).toHaveLength(2)
    expect(step.match(/NEXT_ASSEMBLY_USAGE_OCCURRENCE/g)).toHaveLength(2)
  })
}

test("shows an error when a printed part has no JSCAD geometry", async ({
  page,
}) => {
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: [printedParts[0]],
        },
      },
    }),
  )
  let downloaded = false
  page.on("download", () => {
    downloaded = true
  })
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
  await page.getByRole("button", { name: "Download", exact: true }).click()
  await page.getByRole("menuitem", { name: "Assembly STEP" }).click()
  await expect(page.getByText("Error Downloading Assembly STEP")).toBeVisible()
  await expect(
    page.getByText('Printed part "BASE" needs JSCAD geometry'),
  ).toBeVisible()
  expect(downloaded).toBe(false)
})
