import { expect, test } from "@playwright/test"

const releasesUrl = "https://github.com/tscircuit/tscircuit-standalone/releases"
const releasesApi =
  "https://api.github.com/repos/tscircuit/tscircuit-standalone/releases?*"
const release = (id: number, day: string) => ({
  id,
  name: `tscircuit standalone daily-${day}`,
  tag_name: `daily-${day}`,
  html_url: `${releasesUrl}/tag/daily-${day}`,
  published_at: `${day}T10:30:00Z`,
  draft: false,
  prerelease: true,
})

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
  const product = page.getByRole("navigation", { name: "Product", exact: true })
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
    page.getByRole("link", { name: "Download latest release", exact: true }),
  ).toHaveAttribute("href", `${releasesUrl}/tag/daily-2026-10-10`)
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
    page.getByRole("link", { name: "Download latest release", exact: true }),
  ).toHaveAttribute("href", `${releasesUrl}/tag/daily-2026-10-10`)
  await expect(
    page.getByText(/without outbound web requests/).first(),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "JavaScript runtime included" }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "standalone installation and usage guide" }),
  ).toHaveAttribute(
    "href",
    "https://docs.tscircuit.com/guides/running-tscircuit/standalone-binary",
  )
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
    page.getByRole("link", { name: "Download latest release", exact: true }),
  ).toHaveAttribute("href", `${releasesUrl}/tag/daily-2026-10-10`)
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
    page.getByRole("link", { name: "Download latest release", exact: true }),
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
    page.getByRole("link", { name: "Download latest release", exact: true }),
  ).toHaveAttribute("href", releasesUrl)
})
