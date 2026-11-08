import { expect, test, type Page } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

const outputs = ["dist/index/circuit.json", "dist/examples/led/circuit.json"]
const circuit = (name: string) => [
  ...exampleCircuitJson,
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
    display_name: name,
    center: { x: 0, y: 0 },
    width: 40,
    height: 20,
  },
]

async function mockPreviews(
  page: Page,
  options = { count: 2, invalid: false },
) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          component_path: "index.tsx",
          circuit_json: circuit("Main board"),
        },
      },
    }),
  )
  await page.route("**/package_files/list?*", (route) =>
    route.fulfill({
      json: {
        ok: true,
        package_files: outputs
          .slice(0, options.count)
          .map((file_path, index) => ({
            package_file_id: `preview-${index}`,
            package_release_id: new URL(route.request().url()).searchParams.get(
              "package_release_id",
            ),
            file_path,
            created_at: "2026-01-01T00:00:00Z",
          })),
      },
    }),
  )
  await page.route("**/package_files/get?*", (route) => {
    const id = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )
    if (!id?.startsWith("preview-")) return route.continue()
    return route.fulfill({
      json: {
        package_file: {
          content_text:
            options.invalid && id === "preview-1"
              ? "invalid json"
              : JSON.stringify(
                  circuit(id === "preview-1" ? "LED board" : "Main board"),
                ),
        },
      },
    })
  })
}

const picker = (page: Page) =>
  page.getByRole("combobox", { name: "Preview file" })

async function selectLed(page: Page) {
  await picker(page).click()
  await expect(page.getByRole("option", { name: /^dist\// })).toHaveCount(0)
  await expect(
    page.getByRole("option", { name: "Package default", exact: true }),
  ).toHaveCount(0)
  await expect(page.locator("[cmdk-group-heading]")).toHaveCount(0)
  await page.getByPlaceholder("Find a preview file…").fill("led")
  const entry = page.getByRole("option", {
    name: outputs[1].replace(/^dist\//, ""),
    exact: true,
  })
  await entry.hover()
  await expect(entry).toHaveCSS("cursor", "pointer")
  await expect(entry).toHaveAttribute("data-selected", "true")
  await expect(entry).toHaveCSS("background-color", "rgb(243, 244, 246)")
  await page.getByPlaceholder("Find a preview file…").press("Enter")
}

test("picker is limited to preview tabs and updates the system diagram, URL and history", async ({
  page,
}) => {
  await mockPreviews(page)
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
  await expect(
    page.getByRole("button", { name: "System", exact: true }),
  ).toBeVisible()
  await expect(picker(page)).toHaveCount(0)
  await page.getByRole("button", { name: "System", exact: true }).click()
  await expect(
    page.getByRole("button", {
      name: "Show components for Main board",
      exact: true,
    }),
  ).toBeVisible()
  await expect(picker(page)).toHaveText("2 Builds")
  const buttonStyles = await Promise.all(
    [
      picker(page),
      page.getByRole("button", { name: "Download", exact: true }),
    ].map((button) =>
      button.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
          boxShadow: style.boxShadow,
        }
      }),
    ),
  )
  expect(buttonStyles[0]).toEqual(buttonStyles[1])
  const pickerBounds = (await picker(page).boundingBox())!
  const tabsBounds = (await page
    .getByRole("button", { name: "System", exact: true })
    .boundingBox())!
  const downloadBounds = (await page
    .getByRole("button", { name: "Download", exact: true })
    .boundingBox())!
  expect(
    Math.abs(
      pickerBounds.y +
        pickerBounds.height / 2 -
        tabsBounds.y -
        tabsBounds.height / 2,
    ),
  ).toBeLessThan(8)
  expect(pickerBounds.x + pickerBounds.width).toBeLessThan(downloadBounds.x)
  await selectLed(page)
  await expect(page).toHaveURL(
    /preview_file=dist%2Fexamples%2Fled%2Fcircuit.json#system$/,
  )
  await expect(
    page.getByRole("button", {
      name: "Show components for LED board",
      exact: true,
    }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole("button", {
      name: "Show components for LED board",
      exact: true,
    }),
  ).toBeVisible()
  await picker(page).click()
  await page
    .getByRole("option", {
      name: outputs[0].replace(/^dist\//, ""),
      exact: true,
    })
    .click()
  await expect(
    page.getByRole("button", {
      name: "Show components for Main board",
      exact: true,
    }),
  ).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole("button", {
      name: "Show components for LED board",
      exact: true,
    }),
  ).toBeVisible()
  for (const view of ["PCB", "Schematic", "3D"]) {
    await page.getByRole("button", { name: view, exact: true }).click()
    await expect(picker(page)).toHaveText("2 Builds")
    await expect(page).toHaveURL(
      /preview_file=dist%2Fexamples%2Fled%2Fcircuit.json#/,
    )
  }
  await page.getByRole("button", { name: "Files", exact: true }).click()
  await expect(picker(page)).toHaveCount(0)
})

test("picker is hidden for a single output", async ({ page }) => {
  await mockPreviews(page, { count: 1, invalid: false })
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#system")
  await expect(
    page.getByRole("button", {
      name: "Show components for Main board",
      exact: true,
    }),
  ).toBeVisible()
  await expect(picker(page)).toHaveCount(0)
})

test("a file absent from the selected release falls back to its default", async ({
  page,
}) => {
  await mockPreviews(page)
  await page.goto(
    "http://127.0.0.1:5177/testuser/my-test-board?preview_file=dist%2Fmissing%2Fcircuit.json#system",
  )
  await expect(
    page.getByRole("button", {
      name: "Show components for Main board",
      exact: true,
    }),
  ).toBeVisible()
  await expect(picker(page)).toHaveText("2 Builds")
})

for (const view of ["schematic", "system"]) {
  test(`invalid Circuit JSON leaves the picker available for recovery (${view})`, async ({
    page,
  }) => {
    await mockPreviews(page, { count: 2, invalid: true })
    await page.goto(`http://127.0.0.1:5177/testuser/my-test-board#${view}`)
    await selectLed(page)
    await expect(picker(page)).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`#${view}$`))
    await picker(page).click()
    await page
      .getByRole("option", {
        name: outputs[0].replace(/^dist\//, ""),
        exact: true,
      })
      .click()
    await expect(picker(page)).toHaveText("2 Builds")
    await expect(page).toHaveURL(/preview_file=dist%2Findex%2Fcircuit.json#/)
  })
}

test("picker fits on mobile and preserves a pinned release", async ({
  page,
}) => {
  await mockPreviews(page)
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.goto(
    "http://127.0.0.1:5177/testuser/my-test-board?package_release_id=package_release_3#system",
  )
  await expect(picker(page)).toBeVisible()
  await selectLed(page)
  await expect(
    page.getByRole("button", {
      name: "Show components for LED board",
      exact: true,
    }),
  ).toBeVisible()
  expect(new URL(page.url()).searchParams.get("package_release_id")).toBe(
    "package_release_3",
  )
  await picker(page).click()
  await expect(
    page.getByRole("option", {
      name: outputs[0].replace(/^dist\//, ""),
      exact: true,
    }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})
