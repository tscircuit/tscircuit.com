import { test, expect } from "@playwright/test"

test("the local fake server supports the complete render settings demo without intercepted requests", async ({
  page,
}) => {
  const base = process.env.RENDER_DEMO_URL || "http://127.0.0.1:5177"
  await page.goto(`${base}/api/_fake/render_demo`)
  await expect(
    page.getByText("Fake server: simulated progress", { exact: false }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Generate all three views" }).click()
  await expect(
    page.getByRole("button", { name: "All views requested" }),
  ).toBeDisabled()
  await expect(page.getByRole("img", { name: /rendered board/ })).toHaveCount(
    3,
    { timeout: 25000 },
  )
  for (const image of await page
    .getByRole("img", { name: /rendered board/ })
    .all()) {
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBe(600)
  }
  await page.screenshot({
    path: test.info().outputPath("fake-render-demo.png"),
    fullPage: true,
  })
  await page.reload()
  await expect(page.getByRole("img", { name: /rendered board/ })).toHaveCount(3)
  const download = page.waitForEvent("download")
  await page.getByRole("link", { name: "Download PNG" }).first().click()
  expect((await download).suggestedFilename()).toBe("angled.png")
})
