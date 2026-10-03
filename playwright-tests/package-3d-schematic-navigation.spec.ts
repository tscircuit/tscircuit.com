import { expect, test, type Page } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

// Put R1's model at the board center so a top-down click has a stable target.
const circuitJson = exampleCircuitJson.map((element) =>
  element.type === "cad_component" &&
  element.cad_component_id === "cad_component_0"
    ? {
        ...element,
        position: { x: 0, y: 0, z: 1.2 },
        model_jscad: { type: "cuboid", size: [2, 2, 1] },
      }
    : element,
)

async function open3dView(
  page: Page,
  engine: "manifold" | "jscad",
  hasSchematic = true,
) {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.addInitScript((engine) => {
    localStorage.setItem("cadViewerEngine", engine)
    localStorage.setItem("cadViewerAutoRotate", "false")
  }, engine)
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: hasSchematic
            ? circuitJson
            : circuitJson.filter(
                (element) => !element.type.startsWith("schematic_"),
              ),
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#3d")
  await page.getByRole("button", { name: "Click to Interact" }).click()
  const canvas = page.locator("canvas:visible").last()
  await expect(canvas).toBeVisible()
  const bounds = await canvas.boundingBox()
  if (!bounds) throw new Error("3D canvas has no bounds")
  const center = { x: bounds.width / 2, y: bounds.height / 2 }
  await canvas.click({ button: "right", position: center })
  await page.getByRole("menuitem", { name: /^Camera/ }).hover()
  await page.getByRole("menuitem", { name: "Top Down", exact: true }).click()
  // The viewer animates camera preset changes for 600ms.
  await page.waitForTimeout(700)
  return { canvas, center }
}

for (const engine of ["manifold", "jscad"] as const) {
  test(`package 3D navigation focuses the schematic component (${engine})`, async ({
    page,
  }) => {
    const { canvas, center } = await open3dView(page, engine)
    const action = page.getByRole("menuitem", { name: "Show on schematic" })
    await expect(async () => {
      await canvas.click({ button: "right", position: center })
      await expect(action).toBeVisible()
    }).toPass({ timeout: 15_000 })
    await action.click()
    await expect(page).toHaveURL(/#schematic$/)
    const component = page.locator(
      '[data-schematic-component-id="schematic_component_0"].schematic-search-match',
    )
    await expect(component).toBeVisible()
    await expect(page.locator("canvas:visible")).toHaveCount(0)

    // Returning to the preserved 3D scene can issue the same focus request again.
    await page.getByRole("button", { name: "3D", exact: true }).click()
    await canvas.click({ button: "right", position: center })
    await action.click()
    await expect(page).toHaveURL(/#schematic$/)
    await expect(component).toBeVisible()
  })
}

test("package 3D navigation is omitted when there is no schematic", async ({
  page,
}) => {
  const { canvas, center } = await open3dView(page, "jscad", false)
  await expect(async () => {
    await canvas.click({ button: "right", position: center })
    await expect(
      page.getByRole("menuitem", { name: 'Hide "R1"', exact: true }),
    ).toBeVisible()
  }).toPass({ timeout: 15_000 })
  await expect(page.getByRole("menuitem", { name: /^Camera/ })).toBeVisible()
  await expect(
    page.getByRole("menuitem", { name: "Show on schematic" }),
  ).toHaveCount(0)
  await expect(page).toHaveURL(/#3d$/)
})
