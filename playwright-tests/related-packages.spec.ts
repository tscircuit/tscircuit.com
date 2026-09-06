import { expect, test } from "@playwright/test"

test("related packages load after the initial package render", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 400 })

  let relatedPackagesRequestCount = 0
  page.on("request", (request) => {
    if (request.url().includes("/packages/list_related_packages")) {
      relatedPackagesRequestCount += 1
    }
  })

  await page.goto("http://127.0.0.1:5177/testuser/my-test-board", {
    waitUntil: "domcontentloaded",
  })

  const boundary = page.getByTestId("related-packages-boundary")
  await expect(boundary).toBeAttached()
  await page.waitForTimeout(250)
  expect(relatedPackagesRequestCount).toBe(0)

  await boundary.scrollIntoViewIfNeeded()

  await expect
    .poll(() => relatedPackagesRequestCount, { timeout: 10_000 })
    .toBe(1)
  await expect(
    page.getByRole("heading", { name: "Related Packages" }),
  ).toBeVisible()

  const relatedPackageImages = boundary.locator("img")
  await expect(relatedPackageImages.first()).toHaveAttribute("loading", "lazy")
  await expect(relatedPackageImages.first()).toHaveAttribute(
    "fetchpriority",
    "low",
  )
})
