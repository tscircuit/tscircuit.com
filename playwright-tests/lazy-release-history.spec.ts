import { expect, test, type Page } from "@playwright/test"

const baseUrl = "http://127.0.0.1:5177"
const packagePath = "/testuser/my-test-board"
const olderReleaseId = "older-release"

async function mockPackage(
  page: Page,
  beforeReleaseResponse?: () => Promise<void>,
) {
  const response = await page.request.get(
    `${baseUrl}/api/packages/get?name=testuser%2Fmy-test-board`,
  )
  const { package: pkg } = await response.json()
  const latestReleaseId = pkg.latest_package_release_id
  const releases = [
    {
      package_release_id: latestReleaseId,
      package_id: pkg.package_id,
      version: pkg.latest_version,
      is_latest: true,
      created_at: "2026-10-20T12:00:00Z",
    },
    {
      package_release_id: olderReleaseId,
      package_id: pkg.package_id,
      version: "0.0.0",
      is_latest: false,
      created_at: "2026-10-19T12:00:00Z",
    },
  ]
  const fileListRequests: string[] = []
  const fileRequests: string[] = []
  const readme = (releaseId: string) => ({
    package_file_id: `${releaseId}-readme`,
    package_release_id: releaseId,
    file_path: "README.md",
    content_text:
      releaseId === olderReleaseId
        ? "Older release files"
        : "Latest release files",
  })

  await page.route("**/api/package_releases/get**", async (route) => {
    if (
      new URL(route.request().url()).pathname !== "/api/package_releases/get"
    ) {
      return route.fallback()
    }
    const query = route.request().postDataJSON()
    const release = releases.find((r) =>
      query.package_release_id
        ? query.package_release_id === r.package_release_id
        : query.package_name_with_version
          ? query.package_name_with_version === `${pkg.name}@${r.version}`
          : r.is_latest,
    )
    await beforeReleaseResponse?.()
    await route.fulfill({
      status: release ? 200 : 404,
      json: { package_release: release },
    })
  })
  await page.route("**/api/package_files/list?**", async (route) => {
    const releaseId = new URL(route.request().url()).searchParams.get(
      "package_release_id",
    )!
    fileListRequests.push(releaseId)
    const { content_text, ...metadata } = readme(releaseId)
    await route.fulfill({ json: { package_files: [metadata] } })
  })
  await page.route("**/api/package_files/get?**", async (route) => {
    const query = new URL(route.request().url()).searchParams
    const fileId = query.get("package_file_id")
    const releaseId = fileId?.endsWith("-readme")
      ? fileId.slice(0, -"-readme".length)
      : query.get("package_release_id")
    if (!releaseId) return route.fulfill({ status: 404, json: {} })
    fileRequests.push(releaseId)
    await route.fulfill({ json: { package_file: readme(releaseId) } })
  })
  return { pkg, releases, latestReleaseId, fileListRequests, fileRequests }
}

for (const width of [1280, 390]) {
  test(`release history loads only when the dropdown opens (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    const { releases, latestReleaseId, fileListRequests, fileRequests } =
      await mockPackage(page)
    let historyRequests = 0
    let finishHistory!: () => void
    const historyGate = new Promise<void>((resolve) => {
      finishHistory = resolve
    })
    await page.route("**/api/package_releases/list", async (route) => {
      historyRequests++
      await historyGate
      await route.fulfill({ json: { package_releases: releases } })
    })

    const response = await page.goto(`${baseUrl}${packagePath}#files`)
    expect(await response!.text()).not.toContain("window.SSR_PACKAGE_RELEASES")
    await page.getByRole("button", { name: "README.md", exact: true }).click()
    await expect(
      page.getByText("Latest release files", { exact: true }),
    ).toBeVisible()
    const dropdown = page.getByRole("button", {
      name: "Select release version",
    })
    await expect(dropdown).toBeVisible()
    expect(historyRequests).toBe(0)
    expect(new Set(fileListRequests)).toEqual(new Set([latestReleaseId]))

    try {
      await dropdown.click()
      await expect(
        page.getByRole("menuitem", { name: "Loading releases..." }),
      ).toBeVisible()
      expect(historyRequests).toBe(1)
    } finally {
      finishHistory()
    }
    await expect(page.getByRole("menuitem", { name: /v0\.0\.0/ })).toBeVisible()
    // Listing history must not fetch any historical release's files.
    expect(new Set(fileListRequests)).toEqual(new Set([latestReleaseId]))
    expect(fileRequests).not.toContain(olderReleaseId)
    await page.getByRole("menuitem", { name: /v0\.0\.0/ }).click()
    await expect(page).toHaveURL(/\?version=0\.0\.0#files$/)
    await expect(
      page.getByText("Older release files", { exact: true }),
    ).toBeVisible()
    expect(new Set(fileListRequests)).toEqual(
      new Set([latestReleaseId, olderReleaseId]),
    )

    await dropdown.click()
    await expect(page.getByRole("menuitem", { name: /v0\.0\.0/ })).toBeVisible()
    expect(historyRequests).toBe(1)
    await page.getByRole("menuitem", { name: /v0\.0\.1/ }).click()
    await expect(page).toHaveURL(`${baseUrl}${packagePath}#files`)
    await expect(
      page.getByText("Latest release files", { exact: true }),
    ).toBeVisible()
  })
}

test("opening an older version directly fetches only its files without history", async ({
  page,
}) => {
  const { fileListRequests } = await mockPackage(page)
  let historyRequests = 0
  await page.route("**/api/package_releases/list", (route) => {
    historyRequests++
    return route.fulfill({ json: { package_releases: [] } })
  })
  await page.goto(`${baseUrl}${packagePath}?version=0.0.0#files`)
  await expect(
    page.getByText("Older release files", { exact: true }),
  ).toBeVisible()
  expect(historyRequests).toBe(0)
  expect(new Set(fileListRequests)).toEqual(new Set([olderReleaseId]))
})

test("a failed history request can be retried from the dropdown", async ({
  page,
}) => {
  const { releases } = await mockPackage(page)
  let historyRequests = 0
  await page.route("**/api/package_releases/list", (route) => {
    historyRequests++
    return route.fulfill(
      historyRequests === 1
        ? { status: 503, json: { error: "Unavailable" } }
        : { json: { package_releases: releases } },
    )
  })
  await page.goto(`${baseUrl}${packagePath}#files`)
  await page.getByRole("button", { name: "Select release version" }).click()
  await page
    .getByRole("menuitem", { name: "Failed to load releases. Retry" })
    .click()
  await expect(page.getByRole("menuitem", { name: /v0\.0\.0/ })).toBeVisible()
  expect(historyRequests).toBe(2)
})

test("the dropdown handles an empty release history", async ({ page }) => {
  await mockPackage(page)
  await page.route("**/api/package_releases/list", (route) =>
    route.fulfill({ json: { package_releases: [] } }),
  )
  await page.goto(`${baseUrl}${packagePath}#files`)
  await page.getByRole("button", { name: "Select release version" }).click()
  await expect(
    page.getByRole("menuitem", { name: "No releases found." }),
  ).toBeVisible()
})

test("the editor waits for the selected version without fetching latest files or history", async ({
  page,
}) => {
  let finishRelease!: () => void
  const releaseGate = new Promise<void>((resolve) => {
    finishRelease = resolve
  })
  let releaseRequests = 0
  const { pkg, fileListRequests } = await mockPackage(page, async () => {
    releaseRequests++
    await releaseGate
  })
  let historyRequests = 0
  await page.route("**/api/package_releases/list", (route) => {
    historyRequests++
    return route.fulfill({ json: { package_releases: [] } })
  })
  await page.goto(
    `${baseUrl}/editor?package_id=${pkg.package_id}&version=0.0.0`,
  )
  try {
    await expect.poll(() => releaseRequests).toBe(1)
    expect(fileListRequests).toEqual([])
  } finally {
    finishRelease()
  }
  await expect(page.getByRole("navigation", { name: "breadcrumb" })).toHaveText(
    "README.md",
  )
  expect(new Set(fileListRequests)).toEqual(new Set([olderReleaseId]))
  expect(historyRequests).toBe(0)
})

test("an unavailable editor version shows an error without falling back to latest files", async ({
  page,
}) => {
  const { pkg, fileListRequests } = await mockPackage(page)
  await page.goto(
    `${baseUrl}/editor?package_id=${pkg.package_id}&version=9.9.9`,
  )
  await expect(
    page.getByText("Failed to load release v9.9.9.", { exact: false }),
  ).toBeVisible()
  expect(fileListRequests).toEqual([])
})
