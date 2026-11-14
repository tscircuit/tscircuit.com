import { expect, test } from "@playwright/test"

const baseUrl = "http://127.0.0.1:5177"
const chips = ["CC2340R52E0RGER", "RP2040"]

test("searches for multiple reference chips and saves additions and removals", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token: "reference-design-test",
            account_id: "account-1234",
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    )
  })
  await page.route("**/api/datasheets/list?**", (route) => {
    const query = new URL(route.request().url()).searchParams.get("chip_name")
    return route.fulfill({
      json: {
        datasheets: chips
          .filter((chip) =>
            chip.toLowerCase().includes(query?.toLowerCase() ?? ""),
          )
          .map((chip_name) => ({ chip_name })),
      },
    })
  })
  await page.goto(`${baseUrl}/testuser/my-test-board/settings`)
  const save = page.getByRole("button", { name: "Save reference design chips" })
  await expect(save).toBeDisabled()
  await page.getByRole("button", { name: "Add chips" }).click()
  const search = page.getByRole("combobox", { name: "Search chips" })
  await search.fill("cc2340")
  await page.getByRole("option", { name: chips[0] }).click()
  await search.fill("rp2040")
  await page.getByRole("option", { name: chips[1] }).click()
  await search.press("Escape")
  await save.click()
  await expect(save).toBeDisabled()
  await expect(page.getByText("Setting updated successfully.")).toBeVisible()

  await page.reload()
  const selected = page.getByRole("list", { name: "Selected chips" })
  await expect(selected.getByRole("listitem")).toHaveCount(2)
  await page.getByRole("button", { name: `Remove ${chips[0]}` }).click()
  await save.click()
  await expect(save).toBeDisabled()
  await expect(page.getByText("Setting updated successfully.")).toBeVisible()

  await page.reload()
  await expect(selected.getByRole("listitem")).toHaveCount(1)
  await expect(selected).toContainText(chips[1])
})
