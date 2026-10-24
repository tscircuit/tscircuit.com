import { expect, test } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

test("KiCad download reports a converter load failure without downloading", async ({
  page,
}) => {
  const pageErrors: string[] = []
  const downloads: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))
  page.on("download", (download) =>
    downloads.push(download.suggestedFilename()),
  )

  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: exampleCircuitJson,
        },
      },
    }),
  )
  await page.addInitScript(() => {
    Object.assign(globalThis, {
      tscircuitDynamicImportResolver: (
        specifier: string,
        fallback: (specifier: string) => Promise<unknown>,
      ) => {
        if (specifier === "circuit-json-to-kicad") {
          throw new Error("KiCad converter could not be loaded")
        }
        return fallback(specifier)
      },
    })
  })

  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
  await page.getByRole("button", { name: "Download", exact: true }).click()
  await page.getByRole("menuitem", { name: "KiCad", exact: true }).hover()
  await page.getByRole("menuitem", { name: "Project kicad_*.zip" }).click()

  await expect(
    page.getByText("Error Downloading KiCad Project", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("KiCad converter could not be loaded", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Preparing KiCad project download...", { exact: true }),
  ).toHaveCount(0)
  expect(downloads).toEqual([])
  expect(pageErrors).toEqual([])
})
