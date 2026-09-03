import { expect, test, type Page } from "@playwright/test"
import { gzipSync, strToU8 } from "fflate"

const packageId = "ceec4b8f-865f-4e81-8937-74c8cfa57d89"
const releaseId = "ff2cab7b-d3e3-46e2-9046-c1929999ffe6"
const editorUrl = `http://127.0.0.1:5177/editor?package_id=${packageId}`

const mockPackage = async (
  page: Page,
  files: Record<string, string>,
  beforeFileResponse?: (path: string) => Promise<void>,
) => {
  await page.route("**/api/packages/get?**", async (route) => {
    await route.fulfill({
      json: {
        package: {
          package_id: packageId,
          name: "testuser/default-file-regression",
          unscoped_name: "default-file-regression",
          owner_github_username: "testuser",
          creator_account_id: "account-1234",
          latest_package_release_id: releaseId,
          is_private: false,
          star_count: 0,
        },
      },
    })
  })

  await page.route("**/api/package_releases/get**", async (route) => {
    await route.fulfill({
      json: {
        package_release: {
          package_release_id: releaseId,
          package_id: packageId,
          version: "1.0.0",
        },
      },
    })
  })

  const packageFiles = Object.entries(files).map(
    ([file_path, content_text]) => ({
      package_file_id: file_path,
      package_release_id: releaseId,
      file_path,
      content_text,
      is_text: true,
    }),
  )

  await page.route("**/api/package_files/list?**", async (route) => {
    await route.fulfill({
      json: {
        package_files: packageFiles.map(({ content_text, ...file }) => file),
      },
    })
  })

  await page.route("**/api/package_files/get?**", async (route) => {
    const fileId = new URL(route.request().url()).searchParams.get(
      "package_file_id",
    )
    const file = packageFiles.find((file) => file.package_file_id === fileId)
    if (!file) return route.fulfill({ status: 404, json: {} })

    await beforeFileResponse?.(file.file_path)
    await route.fulfill({ json: { package_file: file } })
  })
}

test("opens the circuit entrypoint even when the lockfile loads first", async ({
  page,
}) => {
  let releaseEntrypoint!: () => void
  const entrypointGate = new Promise<void>((resolve) => {
    releaseEntrypoint = resolve
  })
  await mockPackage(
    page,
    {
      "bun.lock": '{"lockfileVersion": 1}',
      "imports/part.tsx": "export const Part = () => <resistor />",
      "index.circuit.tsx":
        'export default () => <board width="10mm" height="10mm" />',
      "package.json": "{}",
    },
    async (path) => {
      if (path === "index.circuit.tsx") await entrypointGate
    },
  )

  const lockfileLoaded = page.waitForResponse((response) =>
    response.url().includes("package_file_id=bun.lock"),
  )
  await page.goto(editorUrl)
  try {
    await lockfileLoaded
    await expect(page.getByText("Select a file to start editing")).toBeVisible()
    await expect(
      page.getByRole("navigation", { name: "breadcrumb" }),
    ).toHaveCount(0)
  } finally {
    releaseEntrypoint()
  }

  await expect(
    page.getByRole("navigation", { name: "breadcrumb" }),
  ).toContainText("index.circuit.tsx")
})

test("still opens a lockfile explicitly requested in the URL", async ({
  page,
}) => {
  await mockPackage(page, {
    "bun.lock": '{"lockfileVersion": 1}',
    "index.circuit.tsx": "export default () => <board />",
  })

  await page.goto(`${editorUrl}&file_path=bun.lock`)

  await expect(page.getByRole("navigation", { name: "breadcrumb" })).toHaveText(
    "bun.lock",
  )
})

test("a lockfile-only package finishes loading without a default selection", async ({
  page,
}) => {
  await mockPackage(page, { "bun.lock": '{"lockfileVersion": 1}' })
  const lockfileLoaded = page.waitForResponse((response) =>
    response.url().includes("package_file_id=bun.lock"),
  )

  await page.goto(editorUrl)
  await lockfileLoaded

  await expect(page.getByText("Select a file to start editing")).toBeVisible()
  await expect(
    page.getByText("Loading files...", { exact: true }),
  ).not.toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "breadcrumb" }),
  ).toHaveCount(0)
})

test("a lockfile-only URL hash does not reopen the first file", async ({
  page,
}) => {
  const encodedFiles = Buffer.from(
    gzipSync(strToU8(JSON.stringify({ "bun.lock": '{"lockfileVersion": 1}' }))),
  ).toString("base64")

  await page.goto(
    `http://127.0.0.1:5177/editor#data:application/gzip;base64,${encodedFiles}`,
  )

  await expect(page.getByText("Select a file to start editing")).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "breadcrumb" }),
  ).toHaveCount(0)
})
