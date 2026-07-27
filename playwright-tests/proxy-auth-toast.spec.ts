import { expect, test, type Page } from "@playwright/test"

const connectorCode = `export default () => (
  <board>
    <connector name="J1" standard="usb_c" />
  </board>
)`

const runConnectorCode = async (page: Page) => {
  await page.route("**/api/proxy", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unauthorized" }),
    })
  })

  await page.goto("http://127.0.0.1:5177/editor")

  const editor = page.getByRole("textbox").first()
  await editor.fill(connectorCode)

  await page.getByRole("button", { name: "Run", exact: true }).click()
}

test("asks a logged-out user to sign in when the proxy returns 401", async ({
  page,
}) => {
  await runConnectorCode(page)

  await expect(page.getByText("Sign In Required")).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByText("Please sign in to fetch component data, then run again."),
  ).toBeVisible({ timeout: 15_000 })
})

test("reports an authentication failure without clearing the session", async ({
  page,
}) => {
  const response = await page.request.post(
    "http://127.0.0.1:5177/api/internal/sessions/create_without_auth",
    {
      data: { github_username: "testuser" },
    },
  )
  expect(response.ok()).toBe(true)

  const { session } = await response.json()
  await page.addInitScript((session) => {
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            ...session,
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    )
  }, session)

  await runConnectorCode(page)

  await expect(page.getByText("Authentication Failed")).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByText(
      "We couldn't authenticate your session. Please sign out and sign in again.",
    ),
  ).toBeVisible({ timeout: 15_000 })

  const storedSessionToken = await page.evaluate(() => {
    const sessionStore = localStorage.getItem("session_store")
    if (!sessionStore) return null
    return JSON.parse(sessionStore).state?.session?.token ?? null
  })
  expect(storedSessionToken).toBe(session.token)
})
