import { expect, test } from "@playwright/test"

test("related packages render in SSR without a duplicate browser request", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 400 })

  const packageResponse = await page.request.get(
    "http://127.0.0.1:5177/api/packages/get?name=testuser%2Fmy-test-board",
  )
  const { package: sourcePackage } = await packageResponse.json()
  await page.request.get(
    `http://127.0.0.1:5177/api/packages/list_related_packages?package_id=${sourcePackage.package_id}`,
  )

  let relatedPackagesRequestCount = 0
  page.on("request", (request) => {
    if (request.url().includes("/packages/list_related_packages")) {
      relatedPackagesRequestCount += 1
    }
  })

  const navigationResponse = await page.goto(
    "http://127.0.0.1:5177/testuser/my-test-board",
    { waitUntil: "domcontentloaded" },
  )
  const responseHtml = await navigationResponse?.text()
  expect(responseHtml).toContain("ssr-related-packages-heading")
  expect(responseHtml).toContain("window.SSR_RELATED_PACKAGES")

  const boundary = page.getByTestId("related-packages-boundary")
  await expect(boundary).toBeAttached()
  await boundary.scrollIntoViewIfNeeded()
  await expect(
    page.getByRole("heading", { name: "Related Packages" }),
  ).toBeVisible()
  await page.waitForTimeout(500)
  expect(relatedPackagesRequestCount).toBe(0)

  const relatedPackageImages = boundary.locator("img")
  await expect(relatedPackageImages.first()).toHaveAttribute("loading", "lazy")
  await expect(relatedPackageImages.first()).toHaveAttribute(
    "fetchpriority",
    "low",
  )
})
