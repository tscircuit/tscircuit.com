import { expect, test } from "@playwright/test"

test("the hosted preview loads real sample artifacts without the API branch", async ({
  page,
}) => {
  // Software rendering keeps this test independent of the runner's GPU.
  await page.addInitScript(() =>
    localStorage.setItem(
      "pcb_viewer_rendering_engine",
      JSON.stringify("canvas"),
    ),
  )
  await page.route("**/datasheets/get?*", (route) =>
    route.fulfill({
      json: {
        datasheet: {
          chip_name: "NE555DR",
          ai_description: "NE555 timer",
          pin_information: [],
          datasheet_pdf_urls: [],
        },
      },
    }),
  )
  const staticResponses: number[] = []
  const apiRequests: string[] = []
  page.on("response", (response) => {
    if (response.url().includes("/reference-design-preview/"))
      staticResponses.push(response.status())
  })
  page.on("request", (request) => {
    if (
      request.url().includes("/datasheet_reference_designs/list") ||
      request.url().includes("/package_files/download")
    )
      apiRequests.push(request.url())
  })
  await page.goto(
    "http://127.0.0.1:5179/datasheets/NE555DR?reference_design_preview=ne555",
  )
  await expect(page.getByLabel("Configuration", { exact: true })).toBeVisible()
  for (const [configuration, view] of [
    ["slow", "Schematic"],
    ["without_led", "PCB"],
    ["full_board", "3D"],
  ]) {
    const artifact = page.waitForResponse(
      (response) =>
        response.url().includes(`/${configuration}/3d.glb`) &&
        response.status() === 200,
    )
    await page
      .getByLabel("Configuration", { exact: true })
      .selectOption(configuration)
    await artifact
    await page.getByRole("tab", { name: view, exact: true }).click()
    await expect(
      page.getByRole("tab", { name: view, exact: true }),
    ).toHaveAttribute("data-state", "active")
    await expect(page.getByRole("alert")).toHaveCount(0)
  }
  expect(staticResponses.length).toBeGreaterThanOrEqual(7)
  expect(staticResponses.every((status) => status === 200)).toBe(true)
  expect(apiRequests).toEqual([])
})
