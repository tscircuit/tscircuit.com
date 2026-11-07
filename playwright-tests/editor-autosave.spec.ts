import { expect, test, type Page } from "@playwright/test"

const packageId = "ceec4b8f-865f-4e81-8937-74c8cfa57d89"
const releaseId = "ff2cab7b-d3e3-46e2-9046-c1929999ffe6"
const editorUrl = `http://127.0.0.1:5177/editor?package_id=${packageId}`
const initialCode = 'export default () => <board width="10mm" height="10mm" />'
const localDraftKey = `tscircuit:editor-local-draft:account-1234:${packageId}:${releaseId}`

async function replaceCode(page: Page, code: string) {
  await page.locator(".monaco-editor .view-lines").first().click()
  await page.keyboard.press("ControlOrMeta+A")
  await page.keyboard.insertText(code)
}

async function setupEditor(page: Page) {
  let savedCode = initialCode
  let shouldFailSaving = false
  const saveRequests: string[] = []
  const releaseOrBuildRequests: string[] = []

  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      /\/api\/(package_releases\/(create|update|rebuild)|package_builds\/create)/.test(
        request.url(),
      )
    ) {
      releaseOrBuildRequests.push(request.url())
    }
  })

  await page.addInitScript(() => {
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token: "autosave-test-session",
            account_id: "account-1234",
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    )
  })

  await page.route("**/api/packages/get?**", (route) =>
    route.fulfill({
      json: {
        package: {
          package_id: packageId,
          name: "testuser/autosave-regression",
          unscoped_name: "autosave-regression",
          owner_github_username: "testuser",
          creator_account_id: "account-1234",
          latest_package_release_id: releaseId,
          is_private: false,
          star_count: 0,
        },
      },
    }),
  )
  await page.route("**/api/package_files/list?**", (route) =>
    route.fulfill({
      json: {
        package_files: [
          {
            package_file_id: "index-file",
            package_release_id: releaseId,
            file_path: "index.tsx",
            is_text: true,
          },
        ],
      },
    }),
  )
  await page.route("**/api/package_files/get?**", (route) =>
    route.fulfill({
      json: {
        package_file: {
          package_file_id: "index-file",
          package_release_id: releaseId,
          file_path: "index.tsx",
          content_text: savedCode,
          is_text: true,
        },
      },
    }),
  )
  await page.route("**/api/package_files/create_or_update", (route) => {
    const request = route.request().postDataJSON()
    saveRequests.push(request.content_text)
    if (shouldFailSaving) {
      return route.fulfill({
        status: 500,
        json: { error: { error_code: "save_failed", message: "Save failed" } },
      })
    }
    savedCode = request.content_text
    return route.fulfill({
      json: { package_file: { package_file_id: "index-file" } },
    })
  })

  await page.goto(editorUrl)
  await expect(page.getByRole("switch", { name: "Autosave" })).toBeEnabled()
  await expect(page.getByRole("textbox").first()).toBeVisible()

  return {
    saveRequests,
    releaseOrBuildRequests,
    setShouldFailSaving: (shouldFail: boolean) => {
      shouldFailSaving = shouldFail
    },
    setSavedCode: (code: string) => {
      savedCode = code
    },
  }
}

test("autosave stores a local draft without a server write and restores it", async ({
  page,
}) => {
  const { saveRequests, releaseOrBuildRequests } = await setupEditor(page)
  const autosave = page.getByRole("switch", { name: "Autosave" })

  await expect(autosave).toHaveAttribute("data-state", "unchecked")
  await replaceCode(page, 'export default () => <board width="12mm" />')
  await expect(page.getByText("unsaved changes")).toBeVisible()
  await page.waitForTimeout(2300)
  expect(saveRequests).toHaveLength(0)

  await autosave.click()
  await expect(autosave).toHaveAttribute("data-state", "checked")
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), localDraftKey),
    )
    .not.toBeNull()
  expect(saveRequests).toHaveLength(0)
  expect(releaseOrBuildRequests).toHaveLength(0)
  await expect(page.getByText("unsaved changes")).toBeVisible()
  await expect(page.getByText("Draft saved in this browser")).toBeVisible()

  await page.reload()
  await expect(page.getByRole("switch", { name: "Autosave" })).toHaveAttribute(
    "data-state",
    "checked",
  )
  await expect(
    page.locator(".monaco-editor .view-lines").first(),
  ).toContainText('width="12mm"')
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect.poll(() => saveRequests.length).toBe(1)
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), localDraftKey),
    )
    .toBeNull()
  expect(releaseOrBuildRequests).toHaveLength(0)
})

test("failed manual save leaves the local draft available for recovery", async ({
  page,
}) => {
  const { saveRequests, setShouldFailSaving } = await setupEditor(page)
  setShouldFailSaving(true)
  await page.getByRole("switch", { name: "Autosave" }).click()
  await replaceCode(page, 'export default () => <board width="14mm" />')

  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), localDraftKey),
    )
    .not.toBeNull()
  expect(saveRequests).toHaveLength(0)
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect.poll(() => saveRequests.length).toBe(1)
  await expect(page.getByTestId("editor-save-error")).toContainText(
    "Save failed",
  )
  await expect(page.getByText("unsaved changes")).toBeVisible()
  await page.waitForTimeout(2300)
  expect(saveRequests).toHaveLength(1)
  expect(
    await page.evaluate((key) => localStorage.getItem(key), localDraftKey),
  ).not.toBeNull()

  setShouldFailSaving(false)
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect.poll(() => saveRequests.length).toBe(2)
  await expect(page.getByTestId("editor-save-error")).not.toBeVisible()
  await expect(page.getByText("unsaved changes")).not.toBeVisible()
})

test("a server edit to the same file requires explicit draft restoration", async ({
  page,
}) => {
  const { saveRequests, setSavedCode } = await setupEditor(page)
  await page.getByRole("switch", { name: "Autosave" }).click()
  await replaceCode(page, 'export default () => <board width="14mm" />')
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), localDraftKey),
    )
    .not.toBeNull()

  setSavedCode('export default () => <board width="18mm" />')
  await page.reload()
  await expect(page.getByTestId("local-draft-conflict")).toBeVisible()
  await expect(
    page.locator(".monaco-editor .view-lines").first(),
  ).toContainText('width="18mm"')
  expect(saveRequests).toHaveLength(0)

  await page.getByRole("button", { name: "Restore draft" }).click()
  await expect(
    page.locator(".monaco-editor .view-lines").first(),
  ).toContainText('width="14mm"')
})

test("a damaged browser draft stays visible until explicitly discarded", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "{not valid JSON")
  }, localDraftKey)
  const { saveRequests } = await setupEditor(page)

  await expect(page.getByTestId("editor-local-draft-error")).toContainText(
    "Could not read browser draft",
  )
  await replaceCode(page, 'export default () => <board width="16mm" />')
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "Discard draft" }).click()
  await expect(page.getByTestId("editor-local-draft-error")).not.toBeVisible()
  await page.getByRole("switch", { name: "Autosave" }).click()
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), localDraftKey),
    )
    .not.toBeNull()
  expect(saveRequests).toHaveLength(0)
})

test("turning autosave off stops checkpoints without deleting the previous draft", async ({
  page,
}) => {
  const { saveRequests } = await setupEditor(page)
  const autosave = page.getByRole("switch", { name: "Autosave" })
  await autosave.click()
  await replaceCode(page, 'export default () => <board width="20mm" />')
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), localDraftKey),
    )
    .toContain('width=\\"20mm\\"')

  await autosave.click()
  await replaceCode(page, 'export default () => <board width="21mm" />')
  await page.waitForTimeout(2300)
  expect(
    await page.evaluate((key) => localStorage.getItem(key), localDraftKey),
  ).toContain('width=\\"20mm\\"')
  expect(saveRequests).toHaveLength(0)
})

test("leaving the page checkpoints the latest edit without waiting for the timer", async ({
  page,
}) => {
  const { saveRequests } = await setupEditor(page)
  await page.getByRole("switch", { name: "Autosave" }).click()
  await replaceCode(page, 'export default () => <board width="24mm" />')
  await page.reload()
  await expect(
    page.locator(".monaco-editor .view-lines").first(),
  ).toContainText('width="24mm"')
  expect(saveRequests).toHaveLength(0)
})
