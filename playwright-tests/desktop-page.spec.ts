import { expect, test } from "@playwright/test"

const releasesUrl = "https://github.com/tscircuit/tscircuit-desktop/releases"
const releasesApi =
  "https://api.github.com/repos/tscircuit/tscircuit-desktop/releases?*"
const macAssets = ["arm64.dmg", "arm64.zip"]
const windowsAssets = ["x64.exe", "x64.exe.blockmap"]
const linuxAssets = ["x86_64.AppImage"]
const downloadUrl = (version: string, ending: string) =>
  `${releasesUrl}/download/v${version}/tscircuit-desktop-${version}-${ending}`
const release = (
  id: number,
  version: string,
  day: string,
  assetEndings = [...macAssets, ...windowsAssets],
) => ({
  id,
  name: `tscircuit desktop ${version}`,
  tag_name: `v${version}`,
  html_url: `${releasesUrl}/tag/v${version}`,
  published_at: `${day}T10:30:00Z`,
  draft: false,
  prerelease: false,
  assets: assetEndings.map((ending) => ({
    name: `tscircuit-desktop-${version}-${ending}`,
    browser_download_url: downloadUrl(version, ending),
  })),
})

const macUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
const windowsUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
const linuxUserAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

test.beforeEach(async ({ page }) => {
  await page.route(releasesApi, (route) =>
    route.fulfill({
      json: [
        release(1, "0.1.3", "2026-11-13", macAssets),
        { ...release(3, "0.1.9", "2026-11-16"), draft: true },
        release(2, "0.1.7", "2026-11-14"),
      ],
    }),
  )
})

test.describe("on a Mac", () => {
  test.use({ userAgent: macUserAgent })

  test("Desktop offers the newest published disk image", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("http://127.0.0.1:5177/desktop")
    await expect(page).toHaveTitle(
      "tscircuit Desktop — Design electronics with AI agents",
    )
    await expect(
      page.getByRole("heading", { name: "tscircuit Desktop", exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Download for macOS" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "macOS Apple silicon (.dmg)" }),
    ).toHaveAttribute("href", downloadUrl("0.1.7", "arm64.dmg"))
    await expect(
      page.getByText("For Macs with Apple silicon.", { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Windows x64 installer (.exe)" }),
    ).toHaveAttribute("href", downloadUrl("0.1.7", "x64.exe"))
    await expect(page.getByRole("link", { name: /Linux/ })).toHaveCount(0)
    await page.getByText("Other download formats").click()
    await expect(
      page.getByRole("link", { name: "macOS Apple silicon (.zip)" }),
    ).toHaveAttribute("href", downloadUrl("0.1.7", "arm64.zip"))
    await expect(
      page.getByRole("link", { name: "All versions on GitHub", exact: true }),
    ).toHaveAttribute("href", releasesUrl)
    await expect(
      page.getByRole("heading", { name: "Works with your agent" }),
    ).toBeVisible()
  })

  test("GitHub stays available when release lookup fails", async ({ page }) => {
    await page.route(releasesApi, (route) =>
      route.fulfill({ status: 403, json: { message: "Rate limit exceeded" } }),
    )
    await page.goto("http://127.0.0.1:5177/desktop")
    await expect(
      page.getByRole("link", { name: "Browse downloads on GitHub" }),
    ).toHaveAttribute("href", releasesUrl)
  })
})

test.describe("on Windows", () => {
  test.use({ userAgent: windowsUserAgent })

  test("Desktop offers the Windows installer first", async ({ page }) => {
    await page.goto("http://127.0.0.1:5177/desktop")
    await expect(
      page.getByRole("heading", { name: "Download for Windows" }),
    ).toBeVisible()
    await expect(
      page.getByText("For Windows PCs with an x64 processor.", { exact: true }),
    ).toBeVisible()
    const installers = page.getByRole("link", { name: /\((\.dmg|\.exe)\)$/ })
    await expect(installers).toHaveText([
      "Windows x64 installer (.exe)",
      "macOS Apple silicon (.dmg)",
    ])
    await expect(installers.first()).toHaveAttribute(
      "href",
      downloadUrl("0.1.7", "x64.exe"),
    )
  })

  test("Desktop says so when the latest release has no Windows build", async ({
    page,
  }) => {
    await page.route(releasesApi, (route) =>
      route.fulfill({ json: [release(1, "0.1.3", "2026-11-13", macAssets)] }),
    )
    await page.goto("http://127.0.0.1:5177/desktop")
    await expect(
      page.getByRole("heading", { name: "Not available for Windows yet" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "macOS Apple silicon (.dmg)" }),
    ).toHaveAttribute("href", downloadUrl("0.1.3", "arm64.dmg"))
  })
})

test.describe("on Linux", () => {
  test.use({ userAgent: linuxUserAgent })

  test("Desktop points to the other builds until there is a Linux one", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:5177/desktop")
    await expect(
      page.getByRole("heading", { name: "Not available for Linux yet" }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "tscircuit Desktop is built for macOS and Windows so far. Those downloads are below.",
        { exact: true },
      ),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Windows x64 installer (.exe)" }),
    ).toHaveAttribute("href", downloadUrl("0.1.7", "x64.exe"))
  })

  test("Desktop offers the Linux build once a release has one", async ({
    page,
  }) => {
    await page.route(releasesApi, (route) =>
      route.fulfill({
        json: [
          release(4, "0.1.8", "2026-11-15", [
            ...macAssets,
            ...windowsAssets,
            ...linuxAssets,
          ]),
        ],
      }),
    )
    await page.goto("http://127.0.0.1:5177/desktop")
    await expect(
      page.getByRole("heading", { name: "Download for Linux" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Linux x64 (.AppImage)" }),
    ).toHaveAttribute("href", downloadUrl("0.1.8", "x86_64.AppImage"))
  })
})

test("Desktop page fits a phone and is reachable from the product menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("http://127.0.0.1:5177/enterprise")
  await page.getByRole("button", { name: "Open menu", exact: true }).click()
  const product = page
    .locator("details:visible")
    .filter({ has: page.locator("summary", { hasText: "Product" }) })
  await product.locator("summary").click()
  await product
    .getByRole("link", { name: "tscircuit Desktop", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "tscircuit Desktop", exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
