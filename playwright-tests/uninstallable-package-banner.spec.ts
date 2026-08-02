import { expect, test } from "@playwright/test"

test("banner is shown when the latest release has no installable build", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5177/testuser/uninstallable-board")

  const banner = page.getByTestId("no-installable-release-banner")
  await expect(banner).toBeVisible()
  await expect(banner).toContainText("This release has no installable build")
  await expect(banner).toContainText("tsci add testuser/uninstallable-board")
  await expect(banner).toHaveScreenshot("uninstallable-package-banner.png")

  // A package whose release is installable does not get the banner
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
  await expect(
    page.getByRole("heading", { name: "testuser/my-test-board" }),
  ).toBeVisible()
  await expect(page.getByTestId("no-installable-release-banner")).toHaveCount(0)
})
