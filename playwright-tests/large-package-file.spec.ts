import { expect, test, type Page } from "@playwright/test"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { exampleCircuitJson } from "./exampleCircuitJson"

const packageId = "large-file-package"
const releaseId = "large-file-release"
const rootUrl = "http://127.0.0.1:5177/testuser/large-file"
const panel = JSON.stringify(
  Array.from({ length: 50000 }, (_, i) => ({
    type: "pcb_trace",
    pcb_trace_id: `trace_${i}`,
    route: [{ x: i, y: i, width: 0.2, layer: "top", route_type: "wire" }],
  })),
  null,
  2,
)
const hash = (text: string | Buffer) =>
  createHash("sha256").update(text).digest("hex")
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100"/></svg>'

async function mockFiles(page: Page, files: Record<string, string>) {
  const fileRequests: string[] = []
  const release = {
    package_release_id: releaseId,
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  }
  await page.route("**/api/packages/get?**", (route) =>
    route.fulfill({
      json: {
        package: {
          package_id: packageId,
          name: "testuser/large-file",
          unscoped_name: "large-file",
          owner_github_username: "testuser",
          creator_account_id: "account-1234",
          latest_package_release_id: releaseId,
          is_private: false,
          star_count: 0,
        },
      },
    }),
  )
  await page.route("**/api/package_releases/get?**", (route) =>
    route.fulfill({ json: { package_release: release } }),
  )
  await page.route("**/api/package_releases/list?**", (route) =>
    route.fulfill({ json: { package_releases: [release] } }),
  )
  await page.route(
    "**/api/package_releases/get_preview_circuit_json?**",
    (route) =>
      route.fulfill({
        json: { preview_circuit_json_response: { circuit_json_found: false } },
      }),
  )
  const packageFiles = Object.entries(files).map(
    ([file_path, content_text]) => ({
      package_file_id: file_path,
      package_release_id: releaseId,
      file_path,
      content_text,
      created_at: "2026-01-01T00:00:00.000Z",
      is_text: true,
    }),
  )
  await page.route("**/api/package_files/list?**", (route) =>
    route.fulfill({
      json: {
        package_files: packageFiles.map(({ content_text, ...file }) => file),
      },
    }),
  )
  await page.route("**/api/package_files/get?**", (route) => {
    const params = new URL(route.request().url()).searchParams
    const file = packageFiles.find(
      (file) =>
        file.file_path ===
        (params.get("file_path") ?? params.get("package_file_id")),
    )
    if (!file) return route.fulfill({ status: 404, json: {} })
    fileRequests.push(file.file_path)
    return route.fulfill({ json: { package_file: file } })
  })
  await page.route("**/api/package_files/download?**", (route) => {
    const path = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )!
    return route.fulfill({
      body: files[path],
      contentType: path.endsWith(".svg") ? "image/svg+xml" : "text/plain",
    })
  })
  return fileRequests
}

test("opening a large circuit JSON keeps a bounded DOM and full copy/download", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await mockFiles(page, {
    "panel.circuit.json": panel,
    "small.json": '{"name":"R1"}',
  })
  let crashed = false
  page.on("crash", () => {
    crashed = true
  })
  await page.goto(`${rootUrl}#files`)
  await page.getByText("panel.circuit.json", { exact: true }).click()
  const preview = page.getByTestId("code-preview")
  await expect(preview.getByRole("note")).toContainText(
    "Showing a limited preview",
  )
  await expect(preview.locator("pre")).toBeVisible()
  const bounds = await preview.evaluate((element) => ({
    characters: element.querySelector("pre")!.textContent!.length,
    lines: element.querySelectorAll(".line").length,
    nodes: element.querySelectorAll("*").length,
  }))
  expect(bounds.characters).toBeLessThanOrEqual(32768)
  expect(bounds.lines).toBeLessThanOrEqual(1000)
  expect(bounds.nodes).toBeLessThan(30000)
  await page.getByRole("button", { name: "Load PCB preview" }).click()
  await expect(
    page.getByText("This circuit file is too large for an inline preview.", {
      exact: false,
    }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Copy panel.circuit.json" }).click()
  const copiedHash = await page.evaluate(async () => {
    const text = await navigator.clipboard.readText()
    const bytes = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
    )
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  })
  expect(copiedHash).toBe(hash(panel))
  const downloadPromise = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "Download panel.circuit.json" })
    .click()
  const download = await downloadPromise
  expect(hash(await readFile((await download.path())!))).toBe(hash(panel))
  await page.goto(`${rootUrl}/blob/small.json`)
  await expect(page.getByTestId("code-preview").locator("pre")).toHaveText(
    '{"name":"R1"}',
  )
  await expect(page.getByRole("note")).toHaveCount(0)
  expect(crashed).toBe(false)
})

test("prebuilt previews do not fetch JSON; only a requested missing view is generated", async ({
  page,
}) => {
  const requests = await mockFiles(page, {
    "index.circuit.tsx": "export default () => <board />",
    "circuit.json": JSON.stringify(exampleCircuitJson),
    "pcb.svg": svg,
  })
  await page.goto(`${rootUrl}/blob/index.circuit.tsx`)
  await expect(
    page.getByAltText("PCB preview for index.circuit.tsx"),
  ).toBeVisible()
  await expect(page.getByTestId("code-preview").locator("pre")).toBeVisible()
  expect(requests).not.toContain("circuit.json")
  await page.getByRole("tab", { name: "Schematic", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Load Schematic preview" }),
  ).toBeVisible()
  expect(requests).not.toContain("circuit.json")
  await page.getByRole("button", { name: "Load Schematic preview" }).click()
  await expect(
    page.getByAltText("Schematic preview for index.circuit.tsx"),
  ).toBeVisible()
  expect(requests.filter((path) => path === "circuit.json")).toHaveLength(1)
  await page.getByRole("tab", { name: "PCB", exact: true }).click()
  await expect(
    page.getByAltText("PCB preview for index.circuit.tsx"),
  ).toBeVisible()
})
