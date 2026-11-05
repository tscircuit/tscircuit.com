import { expect, test } from "@playwright/test"

const systemJson = [
  {
    type: "system_block_page",
    system_block_page_id: "page",
    name: "overview",
    width: 80,
    height: 60,
  },
  {
    type: "system_block_component",
    system_block_component_id: "controller",
    system_block_page_id: "page",
    display_name: "Controller",
    center: { x: 0, y: 0 },
    width: 40,
    height: 20,
  },
]

for (const mobile of [false, true]) {
  test(`System is available when the package has a system page (${mobile ? "mobile" : "desktop"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: mobile ? 390 : 1440, height: 1000 })
    await page.route(
      "**/package_releases/get_preview_circuit_json?*",
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        await route.fulfill({
          json: {
            preview_circuit_json_response: {
              circuit_json_found: true,
              circuit_json: systemJson,
            },
          },
        })
      },
    )
    await page.goto("http://127.0.0.1:5177/testuser/my-test-board#system")
    await expect(
      page.getByRole("region", { name: "System diagram viewport" }),
    ).toBeVisible()
    await expect(page).toHaveURL(/#system$/)
    const download = page.getByRole("button", { name: "Download", exact: true })
    await expect(download).toBeVisible()
    await expect(download.locator(".sr-only")).toHaveText("Download")
    expect((await download.boundingBox())!.width).toBeLessThan(75)
    await download.click()
    await expect(
      page.getByRole("menuitem", { name: "Circuit JSON" }),
    ).toBeVisible()
    await page.keyboard.press("Escape")
    if (mobile) {
      await page.getByRole("button", { name: "System", exact: true }).click()
      await expect(
        page.getByRole("menuitem", { name: "System", exact: true }),
      ).toBeVisible()
    } else {
      await page.getByRole("button", { name: "Files", exact: true }).click()
      await page.getByRole("button", { name: "System", exact: true }).click()
      await expect(
        page.getByRole("region", { name: "System diagram viewport" }),
      ).toBeVisible()
    }
  })
}

test("System is absent without a page and an unavailable #system falls back to Files", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: [],
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#system")
  await expect(page).toHaveURL(/#files$/)
  await expect(
    page.getByRole("button", { name: "System", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("region", { name: "System diagram viewport" }),
  ).toHaveCount(0)
})

test("associated components show refdes and MPN and focus the schematic", async ({
  page,
}) => {
  const { exampleCircuitJson } = await import("./exampleCircuitJson")
  const circuitJson = [
    ...exampleCircuitJson.map((element) =>
      element.type === "source_component" && element.name === "R1"
        ? { ...element, manufacturer_part_number: "RC0402FR-071KL" }
        : element,
    ),
    ...systemJson.map((element) =>
      element.type === "system_block_component"
        ? { ...element, pcb_component_ids: ["pcb_component_0"] }
        : element,
    ),
  ]
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: circuitJson,
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#system")
  for (let visit = 0; visit < 2; visit++) {
    await page
      .getByRole("button", { name: "Show components for Controller" })
      .click()
    const component = page.getByRole("button", { name: /R1.*RC0402FR-071KL/ })
    await expect(component).toBeVisible()
    await component.click()
    await expect(page).toHaveURL(/#schematic$/)
    await expect(
      page.locator(
        '[data-schematic-component-id="schematic_component_0"].schematic-search-match',
      ),
    ).toBeVisible()
    if (visit === 0)
      await page.getByRole("button", { name: "System", exact: true }).click()
  }
})
