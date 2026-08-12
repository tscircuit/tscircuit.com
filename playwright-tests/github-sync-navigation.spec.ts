import { expect, test, type Page } from "@playwright/test"

const baseUrl = "http://127.0.0.1:5177"
const packagePath = "/testuser/my-test-board"

const installSession = async (page: Page) => {
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
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`GitHub sync opens the build logs on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await installSession(page)

    await page.route("**/packages/start_github_sync", async (route) => {
      await route.fulfill({
        json: {
          start_github_sync_result: {
            ok: true,
            message: "GitHub sync job queued successfully",
          },
        },
      })
    })

    await page.goto(`${baseUrl}${packagePath}`)
    await page.getByRole("button", { name: "Sync from GitHub" }).click()

    await expect(page).toHaveURL(
      /\/testuser\/my-test-board\/releases\/package_release_\d+$/,
    )
  })
}
