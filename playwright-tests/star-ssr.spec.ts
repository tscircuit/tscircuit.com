import { expect, test } from "@playwright/test"

const baseUrl = "http://127.0.0.1:5177"
const username = "testuser"
const packageName = `${username}/my-test-board`

test("preserves and lists the current user's star", async ({ page }) => {
  const accountResponse = await page.request.post(
    `${baseUrl}/api/accounts/get`,
    {
      data: { github_username: username, tscircuit_handle: username },
    },
  )
  expect(accountResponse.ok()).toBe(true)
  const { account } = await accountResponse.json()

  await page.addInitScript((account) => {
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token: account.account_id,
            account_id: account.account_id,
            session_id: `session-${account.account_id}`,
            github_username: account.github_username,
            tscircuit_handle: account.tscircuit_handle,
          },
        },
        version: 0,
      }),
    )
  }, account)

  await page.goto(`${baseUrl}/${packageName}`)

  await page.getByRole("button", { name: /^Star(?: \d+)?$/ }).click()
  await expect(
    page.getByRole("button", { name: /^Starred(?: \d+)?$/ }),
  ).toBeVisible()

  await page.reload()

  const starredButton = page.getByRole("button", {
    name: /^Starred(?: \d+)?$/,
  })
  await expect(starredButton).toBeVisible()
  await starredButton.click()
  const starButton = page.getByRole("button", { name: /^Star(?: \d+)?$/ })
  await expect(starButton).toBeVisible()

  await starButton.click()
  await page.goto(`${baseUrl}/${username}`)
  await page.getByRole("tab", { name: "Starred Packages" }).click()
  await expect(page.getByText("my-test-board", { exact: true })).toBeVisible()
})
