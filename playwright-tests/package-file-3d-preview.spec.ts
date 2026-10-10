import { expect, test } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="green"/></svg>'

async function seedFilePreview(page: import("@playwright/test").Page) {
  const paths = [
    "first.circuit.tsx",
    "second.circuit.tsx",
    "README.md",
    ...["first", "second"].flatMap((name) =>
      ["pcb.svg", "schematic.svg", "circuit.json"].map(
        (artifact) => `dist/${name}/${artifact}`,
      ),
    ),
  ]
  await page.addInitScript(() => {
    localStorage.setItem("cadViewerEngine", "jscad")
    localStorage.setItem("cadViewerAutoRotate", "false")
  })
  await page.route("**/package_files/list?*", async (route) => {
    const releaseId = new URL(route.request().url()).searchParams.get(
      "package_release_id",
    )
    await route.fulfill({
      json: {
        package_files: paths.map((file_path, index) => ({
          package_file_id: `preview-file-${index}`,
          package_release_id: releaseId,
          file_path,
          is_text: true,
        })),
      },
    })
  })
  await page.route("**/package_files/download?*", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: svg }),
  )
  await page.route("**/package_files/get?*", async (route) => {
    const url = new URL(route.request().url())
    const filePath = url.searchParams.get("file_path") ?? ""
    if (!paths.includes(filePath)) return route.continue()
    await route.fulfill({
      json: {
        package_file: {
          package_file_id: `preview-file-${paths.indexOf(filePath)}`,
          package_release_id: url.searchParams.get("package_release_id"),
          file_path: filePath,
          is_text: true,
          content_text: filePath.endsWith("circuit.json")
            ? JSON.stringify(
                filePath.includes("second")
                  ? exampleCircuitJson.map((element) =>
                      element.type === "pcb_board"
                        ? { ...element, width: 30 }
                        : element,
                    )
                  : exampleCircuitJson,
              )
            : "export default () => <board />",
        },
      },
    })
  })
}

test("selected-file 3D preview preserves tabs and file navigation", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 1280, height: 1000 })
  await seedFilePreview(page)
  await page.goto(
    "http://127.0.0.1:5177/testuser/test2-package/blob/first.circuit.tsx",
  )
  const preview = page.getByTestId("file-artifact-preview")
  await expect(preview.getByRole("tab")).toHaveText(["PCB", "Schematic", "3D"])
  await expect(preview.getByRole("img")).toHaveAttribute(
    "alt",
    "PCB preview for first.circuit.tsx",
  )
  await preview.getByRole("tab", { name: "Schematic", exact: true }).click()
  await expect(preview.getByRole("img")).toHaveAttribute(
    "alt",
    "Schematic preview for first.circuit.tsx",
  )
  await preview
    .getByRole("tab", { name: "Schematic", exact: true })
    .press("ArrowRight")
  await expect(
    preview.getByRole("tab", { name: "3D", exact: true }),
  ).toHaveAttribute("aria-selected", "true")
  await preview.getByRole("button", { name: "Click to Interact" }).click()
  await expect(preview.locator("canvas").last()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("file-preview-3d.png") })
  await preview.getByRole("tab", { name: "PCB", exact: true }).click()
  await expect(preview.getByRole("img")).toBeVisible()
  await expect(preview.locator("canvas")).toHaveCount(0)

  await page.getByRole("button", { name: "Files", exact: true }).last().click()
  const circuitRequest = page.waitForResponse(
    (response) =>
      response.url().includes("package_files/get?") &&
      new URL(response.url()).searchParams.get("file_path") ===
        "dist/second/circuit.json",
  )
  await page.getByText("second.circuit.tsx", { exact: true }).first().click()
  await expect(page).toHaveURL(/\/blob\/second\.circuit\.tsx$/)
  await circuitRequest
  await expect(preview.getByRole("img")).toHaveAttribute(
    "alt",
    "PCB preview for second.circuit.tsx",
  )
  await preview.getByRole("tab", { name: "3D", exact: true }).click()
  await expect(
    preview.getByRole("button", { name: "Click to Interact" }),
  ).toBeVisible()
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(
    preview.getByRole("tab", { name: "3D", exact: true }),
  ).toBeInViewport()
  await page.goto("http://127.0.0.1:5177/testuser/test2-package/blob/README.md")
  await expect(preview).toHaveCount(0)
})

for (const unavailable of ["missing", "malformed"] as const) {
  test(`selected-file 3D handles ${unavailable} circuit data`, async ({
    page,
  }) => {
    await seedFilePreview(page)
    await page.route("**/package_files/get?*", async (route) => {
      const filePath = new URL(route.request().url()).searchParams.get(
        "file_path",
      )
      if (filePath !== "dist/first/circuit.json") return route.fallback()
      await route.fulfill(
        unavailable === "missing"
          ? { status: 404, json: { message: "Package file not found" } }
          : { json: { package_file: { content_text: "invalid JSON" } } },
      )
    })
    await page.goto(
      "http://127.0.0.1:5177/testuser/test2-package/blob/first.circuit.tsx",
    )
    const preview = page.getByTestId("file-artifact-preview")
    await preview.getByRole("tab", { name: "3D", exact: true }).click()
    await expect(preview.getByText("Circuit JSON not available")).toBeVisible()
    await preview.getByRole("tab", { name: "PCB", exact: true }).click()
    await expect(preview.getByRole("img")).toBeVisible()
  })
}
