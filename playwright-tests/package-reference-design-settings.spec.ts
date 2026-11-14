import { expect, test } from "@playwright/test"
import { exampleCircuitJson } from "./exampleCircuitJson"

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
  const saved = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname ===
        "/api/packages/update_datasheet_references" &&
      response.request().method() === "POST",
  )
  await save.click()
  const saveResponse = await saved
  expect(saveResponse.request().postDataJSON()).toMatchObject({
    datasheet_references: chips.map((chip_name) => ({ chip_name })),
  })
  expect(await saveResponse.json()).toEqual({ ok: true })
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

test("loads the published preview for a reference design without configuration", async ({
  page,
  request,
}) => {
  const name = "testuser/my-test-board"
  const packageResponse = await request.get(`${baseUrl}/api/packages/get`, {
    params: { name },
  })
  const { package: pkg } = await packageResponse.json()
  const releaseId = pkg.latest_package_release_id
  await page.route("**/api/datasheets/list_reference_designs?**", (route) =>
    route.fulfill({
      json: { reference_designs: [{ name, package_release_id: releaseId }] },
    }),
  )
  await page.route(
    "**/api/package_releases/get_preview_circuit_json?**",
    (route) =>
      route.fulfill({
        json: {
          preview_circuit_json_response: {
            circuit_json_found: true,
            circuit_json: exampleCircuitJson,
          },
        },
      }),
  )
  const previewResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/package_releases/get_preview_circuit_json?") &&
      new URL(response.url()).searchParams.get("package_release_id") ===
        releaseId,
  )
  await page.goto(`${baseUrl}/datasheets/${chips[0]}/reference-designs/${name}`)
  expect((await previewResponse).ok()).toBe(true)
  await expect(
    page.getByRole("button", { name: "Search schematic" }),
  ).toBeVisible()
})
