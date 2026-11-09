import { test, expect, type Page } from "@playwright/test"
import { createHash, randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import type { PublishedReferenceDesign } from "@tscircuit/runframe/reference-designs"
import { exampleCircuitJson } from "./exampleCircuitJson"

const glb = readFileSync(
  new URL("./fixtures/package-preview.glb", import.meta.url),
)
const circuit = JSON.stringify([
  ...exampleCircuitJson,
  {
    type: "schematic_group",
    schematic_group_id: "schematic_group_0",
    source_group_id: "source_group_0",
    is_subcircuit: true,
    subcircuit_id: "subcircuit_source_group_0",
    center: { x: 0, y: 0 },
    width: 0,
    height: 0,
    schematic_component_ids: [],
  },
])
const hash = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex")
const published: PublishedReferenceDesign = {
  package_id: randomUUID(),
  package_release_id: randomUUID(),
  package_name: "testuser/reference-board",
  reference_design: {
    name: "reference_board",
    display_name: "Reference board",
    chip_names: ["EXAMPLE"],
    component_path: "index.tsx",
    props_schema: { type: "object" },
    configurations: ["full_board", "minimal"].map((name) => ({
      name,
      display_name: name === "full_board" ? "Full board" : "Minimal",
      props: { minimal: name === "minimal" },
      circuit_json_path: `dist/${name}/circuit.json`,
      glb_path: `dist/${name}/3d.glb`,
      pcb_svg_path: `dist/${name}/pcb.svg`,
      schematic_svg_path: `dist/${name}/schematic.svg`,
      circuit_json_sha256: hash(circuit),
      glb_sha256: hash(glb),
    })),
  },
  files: ["full_board", "minimal"].flatMap((name) =>
    ["circuit.json", "3d.glb", "pcb.svg", "schematic.svg"].map((file) => ({
      file_path: `dist/${name}/${file}`,
      package_file_id: randomUUID(),
    })),
  ),
}

async function mockDatasheet(page: Page) {
  await page.route("**/datasheets/get?*", (route) =>
    route.fulfill({
      json: {
        datasheet: {
          chip_name: "EXAMPLE",
          ai_description: "Example component",
          pin_information: [],
          datasheet_pdf_urls: [],
        },
      },
    }),
  )
}

test("switches prebuilt configurations, preserves the selected view, and fits mobile", async ({
  page,
}) => {
  await mockDatasheet(page)
  const downloads: string[] = []
  await page.route("**/datasheet_reference_designs/list?*", (route) => {
    expect(route.request().url()).not.toContain("undefined")
    return route.fulfill({
      json: {
        reference_designs: [published],
        pagination: { next_cursor: null },
      },
    })
  })
  await page.route("**/package_files/download?*", (route) => {
    const id = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )
    const file = published.files.find((file) => file.package_file_id === id)!
    downloads.push(file.file_path)
    return route.fulfill({
      body: file.file_path.endsWith(".glb") ? glb : circuit,
    })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE")
  await expect(
    page.getByRole("heading", { name: "Reference designs", exact: true }),
  ).toBeVisible()
  await expect(page.locator("canvas:visible").last()).toBeVisible()
  await page.getByRole("tab", { name: "Schematic", exact: true }).click()
  await page
    .getByLabel("Configuration", { exact: true })
    .selectOption("minimal")
  await expect(
    page.getByRole("tab", { name: "Schematic", exact: true }),
  ).toHaveAttribute("data-state", "active")
  expect(downloads).toContain("dist/minimal/circuit.json")
  expect(downloads).toContain("dist/minimal/3d.glb")
  await expect(page.getByRole("button", { name: "More views" })).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel("Configuration", { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
})

test("rejects changed artifacts and retries without rendering a mixed configuration", async ({
  page,
}) => {
  await mockDatasheet(page)
  await page.route("**/datasheet_reference_designs/list?*", (route) =>
    route.fulfill({
      json: {
        reference_designs: [published],
        pagination: { next_cursor: null },
      },
    }),
  )
  let changed = true
  await page.route("**/package_files/download?*", (route) => {
    const id = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )
    const file = published.files.find((file) => file.package_file_id === id)!
    return route.fulfill({
      body: file.file_path.endsWith(".glb") ? glb : changed ? "[]" : circuit,
    })
  })
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE")
  await expect(page.getByRole("alert")).toContainText(
    "This configuration has changed",
  )
  await expect(page.locator("canvas:visible")).toHaveCount(0)
  changed = false
  await page.getByRole("button", { name: "Retry", exact: true }).click()
  await expect(page.getByRole("alert")).toHaveCount(0)
  await expect(page.locator("canvas:visible").last()).toBeVisible()
})

test("keeps datasheets without reference designs free of an empty section", async ({
  page,
}) => {
  await mockDatasheet(page)
  await page.route("**/datasheet_reference_designs/list?*", (route) =>
    route.fulfill({
      json: { reference_designs: [], pagination: { next_cursor: null } },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/EXAMPLE")
  await expect(
    page.getByText("Example component", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Reference designs", exact: true }),
  ).toHaveCount(0)
})
