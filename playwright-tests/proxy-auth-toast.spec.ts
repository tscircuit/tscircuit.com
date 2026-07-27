import { expect, test, type Page } from "@playwright/test"
import { decodeJwt } from "jose"

const connectorCode = `export default () => (
  <board>
    <connector name="J1" standard="usb_c" />
  </board>
)`

const runConnectorCode = async ({
  page,
  proxyErrorCode,
  nowMs,
}: {
  page: Page
  proxyErrorCode: string
  nowMs?: number
}) => {
  await page.route("**/api/proxy", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error_code: proxyErrorCode }),
    })
  })

  await page.goto("http://127.0.0.1:5177/editor")

  if (nowMs !== undefined) {
    await page.evaluate((mockNowMs) => {
      Date.now = () => mockNowMs
    }, nowMs)
  }

  const editor = page.getByRole("textbox").first()
  await editor.fill(connectorCode)

  await page.getByRole("button", { name: "Run", exact: true }).click()
}

test("asks a logged-out user to sign in when the proxy returns 401", async ({
  page,
}) => {
  await runConnectorCode({ page, proxyErrorCode: "no_token" })

  await expect(page.getByText("Sign In Required")).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByText("Please sign in to fetch component data."),
  ).toBeVisible({ timeout: 15_000 })
})

const installSession = async (page: Page) => {
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

  return session
}

const getStoredSessionToken = (page: Page) =>
  page.evaluate(() => {
    const sessionStore = localStorage.getItem("session_store")
    if (!sessionStore) return null
    return JSON.parse(sessionStore).state?.session?.token ?? null
  })

test("reports an authentication failure without claiming an unexpired token expired", async ({
  page,
}) => {
  const session = await installSession(page)

  await runConnectorCode({ page, proxyErrorCode: "invalid_token" })

  await expect(page.getByText("Authentication Failed")).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByText(
      "We couldn't authenticate your session. Please sign out and sign in again.",
    ),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("Session Expired")).not.toBeVisible()

  const storedSessionToken = await getStoredSessionToken(page)
  expect(storedSessionToken).toBe(session.token)
})

test("reports an expired session without clearing it", async ({ page }) => {
  const session = await installSession(page)
  const expiresAtSeconds = decodeJwt(session.token).exp
  if (typeof expiresAtSeconds !== "number") {
    throw new Error("Expected the test session token to have an expiry")
  }

  await runConnectorCode({
    page,
    proxyErrorCode: "invalid_token",
    nowMs: expiresAtSeconds * 1000 + 1,
  })

  await expect(page.getByText("Session Expired")).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByText(
      "Your session has expired. Please sign out and sign in again.",
    ),
  ).toBeVisible({ timeout: 15_000 })

  const storedSessionToken = await getStoredSessionToken(page)
  expect(storedSessionToken).toBe(session.token)
})
