import { test, expect, type Page } from "@playwright/test"
import { readFileSync } from "node:fs"
import { exampleCircuitJson } from "./exampleCircuitJson"

const glb = readFileSync(
  new URL("./fixtures/package-preview.glb", import.meta.url),
)

async function openPreview(
  page: Page,
  options: {
    status?: number
    hasGlb?: boolean
    deferCircuitJson?: boolean
  } = {},
) {
  const modelRequests: string[] = []
  const glbRequests: string[] = []
  const manifoldRequests: string[] = []
  let finishCircuitJson = () => {}
  const circuitJsonReady = options.deferCircuitJson
    ? new Promise<void>((resolve) => {
        finishCircuitJson = resolve
      })
    : Promise.resolve()
  await page.route(/manifold.*\.(js|wasm)/i, (route) => {
    manifoldRequests.push(route.request().url())
    return route.abort()
  })
  await page.addInitScript(
    (engine) => {
      localStorage.setItem("cadViewerAutoRotate", "false")
      localStorage.setItem("cadViewerEngine", engine)
    },
    options.hasGlb === false || options.status ? "jscad" : "manifold",
  )
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          component_path: "index.tsx",
          circuit_json: exampleCircuitJson.map((element) =>
            element.type === "cad_component"
              ? {
                  ...element,
                  model_obj_url: "./imports/component.obj",
                  model_jscad: { type: "cuboid", size: [2, 2, 1] },
                }
              : element,
          ),
        },
      },
    }),
  )
  await page.route("**/package_files/list?*", async (route) => {
    const response = await route.fetch()
    const data = await response.json()
    if (options.deferCircuitJson) {
      data.package_files.push({
        package_file_id: "selected-release-json",
        package_release_id: data.package_files[0]?.package_release_id,
        file_path: "dist/index/circuit.json",
        content_mimetype: "application/json",
      })
    }
    if (options.hasGlb !== false)
      data.package_files.push({
        package_file_id: "selected-release-glb",
        package_release_id: data.package_files[0]?.package_release_id,
        file_path: "dist/index/3d.glb",
        content_mimetype: "model/gltf-binary",
      })
    await route.fulfill({ json: data })
  })
  await page.route("**/package_files/get?*", async (route) => {
    const id = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )
    if (id !== "selected-release-json") return route.continue()
    await circuitJsonReady
    await route.fulfill({
      json: {
        package_file: { content_text: JSON.stringify(exampleCircuitJson) },
      },
    })
  })
  await page.route("**/package_files/download?*", (route) => {
    const url = new URL(route.request().url())
    if (url.searchParams.get("package_file_id") === "selected-release-glb") {
      glbRequests.push(url.href)
      return route.fulfill({
        status: options.status ?? 200,
        body: options.status ? "missing" : glb,
        contentType: "model/gltf-binary",
      })
    }
    if (url.searchParams.get("file_path")?.includes("component.obj")) {
      modelRequests.push(url.href)
      return route.fulfill({ status: 404, body: "no model" })
    }
    return route.continue()
  })
  const search = options.deferCircuitJson
    ? "?preview_file=dist%2Findex%2Fcircuit.json"
    : ""
  await page.goto(`http://127.0.0.1:5177/testuser/my-test-board${search}#3d`)
  await page.getByRole("button", { name: "Click to Interact" }).click()
  await expect(page.locator("canvas:visible").last()).toBeVisible()
  return { modelRequests, glbRequests, manifoldRequests, finishCircuitJson }
}

test("uses the release GLB without requesting individual models and keeps schematic navigation", async ({
  page,
}) => {
  const requests = await openPreview(page)
  expect(requests.glbRequests).toHaveLength(1)
  expect(requests.modelRequests).toEqual([])
  expect(requests.manifoldRequests).toEqual([])
  const canvas = page.locator("canvas:visible").last()
  const bounds = await canvas.boundingBox()
  if (!bounds) throw new Error("Missing canvas")
  await canvas.click({
    button: "right",
    position: { x: bounds.width / 2, y: bounds.height / 2 },
  })
  await expect(
    page.getByRole("menuitem", { name: 'Hide "R1"', exact: true }),
  ).toBeVisible()
  await page.getByRole("menuitem", { name: "Show on schematic" }).click()
  await expect(page).toHaveURL(/#schematic$/)
  await expect(
    page.locator(
      '[data-schematic-component-id="schematic_component_0"].schematic-search-match',
    ),
  ).toBeVisible()
})

for (const scenario of ["missing", "failed"] as const) {
  test(`falls back to the existing renderer when the GLB is ${scenario}`, async ({
    page,
  }) => {
    const requests = await openPreview(
      page,
      scenario === "missing" ? { hasGlb: false } : { status: 404 },
    )
    expect(requests.glbRequests).toHaveLength(scenario === "missing" ? 0 : 1)
    expect(requests.modelRequests.length).toBeGreaterThan(0)
  })
}

test("renders the selected GLB while its Circuit JSON is still pending and Manifold is blocked", async ({
  page,
}) => {
  const requests = await openPreview(page, { deferCircuitJson: true })
  // StrictMode may cancel and retry the first request when mounting the selected scene.
  expect(requests.glbRequests.length).toBeGreaterThan(0)
  expect(new Set(requests.glbRequests).size).toBe(1)
  expect(requests.modelRequests).toEqual([])
  expect(requests.manifoldRequests).toEqual([])
  await expect(page.getByText(/Loading Manifold/i)).toHaveCount(0)
  const jsonResponse = page.waitForResponse((response) =>
    response.url().includes("package_file_id=selected-release-json"),
  )
  requests.finishCircuitJson()
  await jsonResponse
})
