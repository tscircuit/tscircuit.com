import { expect, test } from "@playwright/test"

test("shows sign-in guidance instead of the JLCPCB dialog for an expired session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token: "stale-session-token",
            account_id: "account-1234",
            session_id: "expired-session",
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    )
  })

  await page.route("**/api/sessions/list", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        error_code: "session_expired",
        message: "Session expired",
      }),
    })
  })

  await page.goto("http://127.0.0.1:5177/quickstart")
  await page.getByRole("button", { name: "Import JLCPCB" }).click()

  await expect(page.getByText("Session Expired")).toBeVisible()
  await expect(
    page.getByText("Your session has expired. Click here to sign in again."),
  ).toBeVisible()
  await expect(
    page.getByRole("dialog", { name: /Import JLCPCB Parts Component/i }),
  ).not.toBeVisible()
})
