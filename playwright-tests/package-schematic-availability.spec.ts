import { expect, test, type Page } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

const pcbOnlyCircuitJson = exampleCircuitJson.filter(
  (element) => !element.type.startsWith("schematic_"),
)

async function openPackage(
  page: Page,
  circuitJson: unknown[] | null,
  hash = "files",
) {
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: circuitJson !== null,
          circuit_json: circuitJson,
        },
      },
    }),
  )
  await page.goto(`http://127.0.0.1:5177/testuser/my-test-board#${hash}`)
}

async function mockPackageInfo(page: Page, updates: Record<string, unknown>) {
  const response = await page.request.get(
    "http://127.0.0.1:5177/api/packages/get?name=testuser%2Fmy-test-board",
  )
  const json = await response.json()
  await page.route("**/packages/get?*", (route) =>
    route.fulfill({
      json: { ...json, package: { ...json.package, ...updates } },
    }),
  )
}

test("desktop disables Schematic for a PCB-only board while keeping other tabs enabled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openPackage(page, pcbOnlyCircuitJson)
  await expect(
    page.getByRole("button", { name: "Schematic", exact: true }),
  ).toBeDisabled()
  for (const name of ["Files", "3D", "PCB", "BOM"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeEnabled()
  }
  await expect(page).toHaveURL(/#files$/)
})

test("desktop enables Schematic when schematic elements are present", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await mockPackageInfo(page, {
    latest_sch_preview_image_url: "/schematic-preview.svg",
  })
  await page.route("**/schematic-preview.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">R1</text></svg>',
    }),
  )
  await openPackage(page, exampleCircuitJson)
  await expect(
    page.getByRole("button", { name: "Schematic View preview" }),
  ).toBeVisible()
  const schematic = page.getByRole("button", {
    name: "Schematic",
    exact: true,
  })
  await expect(schematic).toBeEnabled()
  await schematic.click()
  await expect(page).toHaveURL(/#schematic$/)
  await expect(
    page.locator('[data-schematic-component-id="schematic_component_0"]'),
  ).toBeVisible()
})

for (const hasSchematic of [false, true]) {
  test(`mobile Schematic availability matches the board (has schematic: ${hasSchematic})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openPackage(
      page,
      hasSchematic ? exampleCircuitJson : pcbOnlyCircuitJson,
    )
    await page.getByRole("button", { name: "Files", exact: true }).click()
    await expect(
      page.getByRole("menuitem", { name: "PCB", exact: true }),
    ).toBeEnabled()
    const schematic = page.getByRole("menuitem", {
      name: "Schematic",
      exact: true,
    })
    if (hasSchematic) {
      await expect(schematic).toBeEnabled()
      await schematic.click()
      await expect(page).toHaveURL(/#schematic$/)
    } else {
      await expect(schematic).toBeDisabled()
      await expect(page).toHaveURL(/#files$/)
    }
  })
}

test("a schematic deep link falls back to Files for a PCB-only board", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openPackage(page, pcbOnlyCircuitJson, "schematic")
  await expect(page).toHaveURL(/#files$/)
  await expect(
    page.getByRole("button", { name: "Schematic", exact: true }),
  ).toBeDisabled()
})

test("a schematic default view falls back to Files for a PCB-only board", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await mockPackageInfo(page, { default_view: "schematic" })
  await openPackage(page, pcbOnlyCircuitJson, "")
  await expect(page).toHaveURL(/#files$/)
  await expect(
    page.getByRole("button", { name: "Schematic", exact: true }),
  ).toBeDisabled()
})

test("missing circuit JSON still disables all circuit-dependent tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await openPackage(page, null)
  for (const name of ["3D", "PCB", "Schematic", "BOM"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled()
  }
  await expect(
    page.getByRole("button", { name: "Files", exact: true }),
  ).toBeEnabled()
})

for (const width of [1280, 390]) {
  test(`hides an existing empty schematic snapshot at width ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await mockPackageInfo(page, {
      latest_sch_preview_image_url: "/empty-schematic.svg",
    })
    let snapshotRequests = 0
    await page.route("**/empty-schematic.svg", (route) => {
      snapshotRequests++
      return route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#F5F1ED"/></svg>',
      })
    })
    await openPackage(page, pcbOnlyCircuitJson)
    if (width === 1280) {
      await expect(
        page.getByRole("button", { name: "PCB", exact: true }),
      ).toBeEnabled()
    } else {
      await page.getByRole("button", { name: "Files", exact: true }).click()
      await expect(
        page.getByRole("menuitem", { name: "PCB", exact: true }),
      ).toBeEnabled()
    }
    await expect(
      page.getByRole("button", { name: "Schematic View preview" }),
    ).toHaveCount(0)
    await expect(page.locator('img[src="/empty-schematic.svg"]')).toHaveCount(0)
    expect(snapshotRequests).toBe(0)
  })
}
