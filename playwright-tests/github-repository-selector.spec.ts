import { expect, test, type Page } from "@playwright/test"

const baseUrl = "http://127.0.0.1:5177"

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

test("repository selector supports keyboard navigation without password manager interference", async ({
  page,
}) => {
  await installSession(page)
  await page.route("**/github/repos/list_available**", async (route) => {
    await route.fulfill({
      json: {
        repos: [
          { full_name: "testuser/first-board", private: false },
          { full_name: "testuser/second-board", private: false },
        ],
      },
    })
  })

  await page.goto(`${baseUrl}/testuser/my-test-board/settings?tab=github`)
  const repositoryCombobox = page.getByRole("combobox", {
    name: "GitHub Repository",
  })
  await repositoryCombobox.click()

  const searchInput = page.getByPlaceholder("Search repositories...")
  await expect(searchInput).toHaveAttribute("autocomplete", "off")
  await expect(searchInput).toHaveAttribute("data-1p-ignore", "true")
  await expect(searchInput).toHaveAttribute("data-lpignore", "true")

  await searchInput.press("ArrowDown")
  await searchInput.press("Enter")

  await expect(repositoryCombobox).toContainText("testuser/second-board")
})
