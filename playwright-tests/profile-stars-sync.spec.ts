import { expect, test, type Route } from "@playwright/test"

for (const initiallyStarred of [false, true]) {
  test(`profile updates when ${initiallyStarred ? "removing" : "adding"} a star finishes after navigation`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "session_store",
        JSON.stringify({
          state: {
            session: {
              token: "profile-stars-test",
              account_id: "account-1234",
              session_id: "session-1234",
              github_username: "testuser",
              tscircuit_handle: "testuser",
            },
          },
          version: 0,
        }),
      )
    })

    let isStarred = initiallyStarred
    let pendingStar: Route | undefined
    await page.route("**/packages/get?**", async (route) => {
      const response = await route.fetch()
      const data = await response.json()
      data.package.is_starred = isStarred
      await route.fulfill({ json: data })
    })
    await page.route("**/packages/list", async (route) => {
      if (!route.request().postDataJSON()?.starred_by) {
        await route.continue()
        return
      }
      const response = await page.request.get(
        "http://127.0.0.1:5177/api/packages/get?name=testuser/my-test-board",
      )
      const { package: pkg } = await response.json()
      await route.fulfill({
        json: { ok: true, packages: isStarred ? [pkg] : [] },
      })
    })
    await page.route(
      `**/packages/${initiallyStarred ? "remove_star" : "add_star"}`,
      (route) => {
        pendingStar = route
      },
    )

    await page.goto("http://127.0.0.1:5177/testuser/my-test-board#files")
    await page
      .getByRole("button", { name: initiallyStarred ? /^Starred/ : /^Star\b/ })
      .click()
    await expect.poll(() => Boolean(pendingStar)).toBe(true)
    await page.getByRole("link", { name: "My Profile", exact: true }).click()
    await page.getByRole("tab", { name: "Starred Packages" }).click()

    const packageLink = page.locator('a[href="/testuser/my-test-board"]')
    await expect(packageLink).toHaveCount(initiallyStarred ? 1 : 0)
    if (!initiallyStarred) {
      await expect(
        page.getByText("No starred packages", { exact: true }),
      ).toBeVisible()
    }

    isStarred = !initiallyStarred
    await pendingStar!.fulfill({ json: { ok: true } })
    await expect(packageLink).toHaveCount(initiallyStarred ? 0 : 1)
  })
}
