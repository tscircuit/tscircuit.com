import { expect, test } from "@playwright/test"
import { readFile } from "node:fs/promises"
import JSZip from "jszip"
import { exampleCircuitJson } from "./exampleCircuitJson"

const modelBaseUrl = "http://127.0.0.1:5177/kicad-test-models/"
const modelContent = "#VRML V2.0 utf8\nShape { geometry Box { size 1 1 1 } }\n"
const warningTitle = "KiCad project downloaded with missing 3D models"
const circuitJson = exampleCircuitJson.map((element) =>
  element.type === "cad_component"
    ? {
        ...element,
        model_wrl_url: `${modelBaseUrl}${element.cad_component_id}.wrl`,
      }
    : element,
)

for (const missingModels of [1, 2, 0]) {
  test(`KiCad ZIP download reports ${missingModels} missing models`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(60_000)
    await page.route(
      "**/package_releases/get_preview_circuit_json?*",
      (route) =>
        route.fulfill({
          json: {
            preview_circuit_json_response: {
              circuit_json_found: true,
              circuit_json: circuitJson,
            },
          },
        }),
    )
    // Use the real converter, pinned so the browser regression is repeatable.
    await page.addInitScript(() => {
      Object.assign(globalThis, {
        tscircuitDynamicImportResolver: (
          specifier: string,
          fallback: (specifier: string) => Promise<unknown>,
        ) =>
          fallback(
            specifier === "circuit-json-to-kicad"
              ? "circuit-json-to-kicad@0.0.241"
              : specifier,
          ),
      })
    })
    const modelRequests: string[] = []
    await page.route(`${modelBaseUrl}**`, (route) => {
      const url = route.request().url()
      modelRequests.push(url)
      const shouldFail =
        missingModels === 2 ||
        (missingModels === 1 && url.endsWith("cad_component_0.wrl"))
      return route.fulfill({
        status: shouldFail ? 404 : 200,
        contentType: shouldFail ? "text/plain" : "model/vrml",
        body: shouldFail ? "Model not found" : modelContent,
      })
    })

    await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
    await page.getByRole("button", { name: "Download", exact: true }).click()
    await page.getByRole("menuitem", { name: "KiCad", exact: true }).hover()
    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("menuitem", { name: "Project kicad_*.zip" }).click()
    const download = await downloadPromise
    const zipPath = testInfo.outputPath("project.zip")
    await download.saveAs(zipPath)

    if (missingModels) {
      await expect(page.getByText(warningTitle, { exact: true })).toBeVisible()
      const message = `${missingModels} 3D model${missingModels === 1 ? "" : "s"} could not be included. The PCB and schematic files are included.`
      await expect(page.getByText(message, { exact: true })).toBeVisible()
    } else {
      await expect(page.getByText(warningTitle, { exact: true })).toHaveCount(0)
    }
    await expect(
      page.getByText("Preparing KiCad project download...", { exact: true }),
    ).toHaveCount(0)
    expect(modelRequests.sort()).toEqual([
      `${modelBaseUrl}cad_component_0.wrl`,
      `${modelBaseUrl}cad_component_1.wrl`,
    ])

    const zip = await JSZip.loadAsync(await readFile(zipPath))
    for (const extension of ["kicad_pcb", "kicad_sch", "kicad_pro"]) {
      expect(
        await zip.file(`my-test-board.${extension}`)?.async("string"),
      ).toBeTruthy()
    }
    const models = Object.keys(zip.files).filter((name) =>
      name.endsWith(".wrl"),
    )
    expect(models).toHaveLength(2 - missingModels)
    for (const model of models) {
      expect(await zip.file(model)?.async("string")).toBe(modelContent)
    }
  })
}
