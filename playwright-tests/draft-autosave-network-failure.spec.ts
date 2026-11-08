import { expect, test } from "@playwright/test"

// Run with the fake API. No production drafts or builds are modified.
test("a network failure does not acknowledge an autosave", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token:
              "eyJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X2lkIjoiYWNjb3VudC0xMjM0Iiwic2Vzc2lvbl9pZCI6InNlc3Npb24tdGVzdCJ9.signature",
            account_id: "account-1234",
            session_id: "session-test",
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    )
  })

  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
  await page.keyboard.press("Control+Enter")
  await expect(page).toHaveURL(/\/editor\?package_id=/)

  const buildAndExit = page.getByRole("button", { name: "Build & Exit" })
  await expect(buildAndExit).toBeVisible()

  const editorNav = page.locator("nav").filter({ has: buildAndExit })
  const draftStatus = editorNav.getByRole("status")
  await expect(draftStatus).toContainText("Changes saved")

  await page.route("**/package_drafts/save", async (route) => {
    await route.abort("failed")
  })

  await page.locator(".monaco-editor").first().click()
  await page.keyboard.press("Control+End")
  await page.keyboard.insertText("\n// deliberately unsaved after network loss")

  await expect(draftStatus).toContainText("Save failed", { timeout: 15000 })
  await expect(draftStatus).not.toContainText("Changes saved")

  // The user must remain in the editor until the server accepts the save.
  await buildAndExit.click()
  await page.getByRole("button", { name: "Keep draft & exit" }).click()
  await expect(page.getByRole("alert")).toBeVisible()
  await expect(page).toHaveURL(/\/editor\?package_id=/)
})
