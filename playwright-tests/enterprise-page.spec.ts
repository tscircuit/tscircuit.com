import { expect, test } from "@playwright/test"

const releasesUrl = "https://github.com/tscircuit/tscircuit-standalone/releases"
const releasesApi =
  "https://api.github.com/repos/tscircuit/tscircuit-standalone/releases?*"
const installerNames = [
  "tscircuit-standalone-macos-arm64.pkg",
  "tscircuit-standalone-macos-x64.pkg",
  "tscircuit-standalone-windows-x64-setup.exe",
  "tscircuit-standalone-linux-x64.tar.gz",
  "tscircuit-standalone-linux-arm64.tar.gz",
]
const release = (id: number, day: string) => ({
  id,
  name: `tscircuit standalone daily-${day}`,
  tag_name: `daily-${day}`,
  html_url: `${releasesUrl}/tag/daily-${day}`,
  published_at: `${day}T10:30:00Z`,
  draft: false,
  prerelease: true,
  assets: [...installerNames, "tsci-windows-x64.exe", "SHA256SUMS"].map(
    (name) => ({
      name,
      browser_download_url: `${releasesUrl}/download/daily-${day}/${name}`,
    }),
  ),
})

test.use({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" })

test.beforeEach(async ({ page }) => {
  await page.route(releasesApi, (route) =>
    route.fulfill({
      json: [
        { ...release(1, "2026-10-08"), prerelease: false },
        { ...release(4, "2026-10-11"), draft: true },
        release(3, "2026-10-10"),
        { ...release(5, "2026-10-12"), published_at: null },
        release(2, "2026-10-09"),
      ],
    }),
  )
})

test("Product menu includes the four destinations and icons", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("http://127.0.0.1:5177/enterprise")
  await page.getByRole("button", { name: "Product", exact: true }).click()
  const product = page.getByRole("navigation", {
    name: "Product",
    exact: true,
  })
  for (const [name, href] of [
    ["Online Playground", "/playground"],
    ["NPM Package", "https://www.npmjs.com/package/tscircuit"],
    ["tscircuit Skill", "https://github.com/tscircuit/skill"],
    ["tscircuit Enterprise", "/enterprise"],
  ]) {
    const link = product.getByRole("link", { name, exact: true })
    await expect(link).toHaveAttribute("href", href)
    await expect(link.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  }
  await expect(
    page.getByRole("link", {
      name: "Windows x64 installer (.exe)",
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `${releasesUrl}/download/daily-2026-10-10/tscircuit-standalone-windows-x64-setup.exe`,
  )
  await expect(page).toHaveScreenshot("product-menu.png")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Community", exact: true }).click()
  await expect(
    page
      .getByRole("navigation", { name: "Community", exact: true })
      .getByRole("link", { name: "Blog", exact: true }),
  ).toHaveAttribute("href", "https://blog.tscircuit.com")
})

test("Enterprise links the newest published prerelease and explains local use", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("http://127.0.0.1:5177/enterprise")
  await expect(page).toHaveTitle(
    "tscircuit Enterprise — Offline circuit design",
  )
  await expect(
    page.getByRole("heading", { name: "tscircuit Enterprise", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "Windows x64 installer (.exe)",
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `${releasesUrl}/download/daily-2026-10-10/tscircuit-standalone-windows-x64-setup.exe`,
  )
  await expect(
    page.getByText(/without outbound web requests/).first(),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "JavaScript runtime included" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Recommended for Windows" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Getting started", exact: true }),
  ).toHaveCount(0)
  await expect(page.locator("main pre")).toHaveCount(0)
  await expect(page.locator("main")).not.toContainText("curl")
  await expect(page.locator("main")).toHaveScreenshot("enterprise-desktop.png")
})

test("Product navigation and Enterprise page work on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("http://127.0.0.1:5177/enterprise")
  await page.getByRole("button", { name: "Open menu", exact: true }).click()
  const product = page
    .locator("details")
    .filter({ has: page.locator("summary", { hasText: "Product" }) })
  await product.locator("summary").click()
  await expect(product.getByRole("link")).toHaveCount(4)
  await expect(product).toHaveScreenshot("product-mobile.png")
  await product
    .getByRole("link", { name: "tscircuit Enterprise", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Open menu", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "Windows x64 installer (.exe)",
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `${releasesUrl}/download/daily-2026-10-10/tscircuit-standalone-windows-x64-setup.exe`,
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await expect(page.locator("main")).toHaveScreenshot("enterprise-mobile.png")
})

test("GitHub download links remain available when release lookup fails", async ({
  page,
}) => {
  await page.route(releasesApi, (route) =>
    route.fulfill({ status: 403, json: { message: "Rate limit exceeded" } }),
  )
  await page.goto("http://127.0.0.1:5177/enterprise")
  await expect(
    page.getByRole("link", {
      name: "Browse installers on GitHub",
      exact: true,
    }),
  ).toHaveAttribute("href", releasesUrl)
  await expect(
    page.getByRole("link", { name: "All versions on GitHub", exact: true }),
  ).toHaveAttribute("href", releasesUrl)
})

test("Enterprise handles the first release not being published yet", async ({
  page,
}) => {
  await page.route(releasesApi, (route) => route.fulfill({ json: [] }))
  await page.goto("http://127.0.0.1:5177/enterprise")
  await expect(
    page.getByRole("link", {
      name: "Browse installers on GitHub",
      exact: true,
    }),
  ).toHaveAttribute("href", releasesUrl)
})

for (const { os, userAgent, labels } of [
  {
    os: "macOS",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    labels: ["macOS Apple silicon (.pkg)", "macOS Intel (.pkg)"],
  },
  {
    os: "Linux",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    labels: ["Linux x64 archive (.tar.gz)", "Linux ARM64 archive (.tar.gz)"],
  },
]) {
  test.describe(os, () => {
    test.use({ userAgent })
    test(`recommends ${os} downloads and offers other platforms`, async ({
      page,
    }) => {
      await page.goto("http://127.0.0.1:5177/enterprise")
      await expect(
        page.getByRole("heading", { name: `Recommended for ${os}` }),
      ).toBeVisible()
      for (const label of labels) {
        await expect(
          page.getByRole("link", { name: label, exact: true }),
        ).toBeVisible()
      }
      const otherPlatforms = page.locator("main details")
      await otherPlatforms.locator("summary").click()
      await expect(
        otherPlatforms.getByRole("link", {
          name: "Windows x64 installer (.exe)",
          exact: true,
        }),
      ).toHaveAttribute(
        "href",
        `${releasesUrl}/download/daily-2026-10-10/tscircuit-standalone-windows-x64-setup.exe`,
      )
    })
  })
}

test.describe("mobile OS", () => {
  test.use({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8)" })
  test("offers all downloads when visiting from a mobile device", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:5177/enterprise")
    await expect(
      page.getByRole("heading", { name: "Choose your download" }),
    ).toBeVisible()
    for (const assetName of installerNames) {
      await expect(page.locator(`main a[href$="/${assetName}"]`)).toBeVisible()
    }
  })
})

test("does not invent a download URL when an installer is missing", async ({
  page,
}) => {
  await page.route(releasesApi, (route) =>
    route.fulfill({
      json: [
        {
          ...release(3, "2026-10-10"),
          assets: [
            {
              name: "tsci-windows-x64.exe",
              browser_download_url: `${releasesUrl}/download/daily-2026-10-10/tsci-windows-x64.exe`,
            },
          ],
        },
      ],
    }),
  )
  await page.goto("http://127.0.0.1:5177/enterprise")
  await expect(
    page.getByRole("link", {
      name: "Browse installers on GitHub",
      exact: true,
    }),
  ).toHaveAttribute("href", `${releasesUrl}/tag/daily-2026-10-10`)
  await expect(page.locator("main a[href$='.exe']")).toHaveCount(0)
})
