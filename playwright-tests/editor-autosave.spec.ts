import { expect, test, type Page } from "@playwright/test"

const packageId = "ceec4b8f-865f-4e81-8937-74c8cfa57d89"
const releaseId = "ff2cab7b-d3e3-46e2-9046-c1929999ffe6"
const editorUrl = `http://127.0.0.1:5177/editor?package_id=${packageId}`
const initialCode = 'export default () => <board width="10mm" height="10mm" />'

async function replaceCode(page: Page, code: string) {
  await page.locator(".monaco-editor .view-lines").first().click()
  await page.keyboard.press("ControlOrMeta+A")
  await page.keyboard.insertText(code)
}

async function setupEditor(page: Page) {
  let savedCode = initialCode
  let shouldFailSaving = false
  const saveRequests: string[] = []

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
    setShouldFailSaving: (shouldFail: boolean) => {
      shouldFailSaving = shouldFail
    },
  }
}

test("autosave is opt-in, debounced, and remembered", async ({ page }) => {
  const { saveRequests } = await setupEditor(page)
  const autosave = page.getByRole("switch", { name: "Autosave" })

  await expect(autosave).toHaveAttribute("data-state", "unchecked")
  await replaceCode(page, 'export default () => <board width="12mm" />')
  await expect(page.getByText("unsaved changes")).toBeVisible()
  await page.waitForTimeout(2300)
  expect(saveRequests).toHaveLength(0)

  await autosave.click()
  await expect(autosave).toHaveAttribute("data-state", "checked")
  await expect.poll(() => saveRequests.length).toBe(1)
  await expect(page.getByText("unsaved changes")).not.toBeVisible()

  await page.reload()
  await expect(page.getByRole("switch", { name: "Autosave" })).toHaveAttribute(
    "data-state",
    "checked",
  )
})

test("failed autosave keeps the changes and allows a manual retry", async ({
  page,
}) => {
  const { saveRequests, setShouldFailSaving } = await setupEditor(page)
  setShouldFailSaving(true)
  await page.getByRole("switch", { name: "Autosave" }).click()
  await replaceCode(page, 'export default () => <board width="14mm" />')

  await expect.poll(() => saveRequests.length).toBe(1)
  await expect(page.getByTestId("editor-save-error")).toContainText(
    "Save failed",
  )
  await expect(page.getByText("unsaved changes")).toBeVisible()
  await page.waitForTimeout(2300)
  expect(saveRequests).toHaveLength(1)

  setShouldFailSaving(false)
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect.poll(() => saveRequests.length).toBe(2)
  await expect(page.getByTestId("editor-save-error")).not.toBeVisible()
  await expect(page.getByText("unsaved changes")).not.toBeVisible()
})
