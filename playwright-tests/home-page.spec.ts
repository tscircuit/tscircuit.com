import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

const appUrl = "http://127.0.0.1:5177"

for (const [size, viewport] of Object.entries(viewports)) {
  for (const path of ["/dashboard", "/not/a/real/page"]) {
    test(`Logo loads the server landing page from ${path} on ${size}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto(`${appUrl}${path}`)
      const logo = page.getByRole("link", { name: "tscircuit", exact: true })
      await expect(logo).toBeVisible()

      // Model Vercel's root rewrite. A client-side Link never requests this
      // document, which was why the duplicate landing page appeared.
      await page.route(`${appUrl}/`, async (route) => {
        expect(route.request().isNavigationRequest()).toBe(true)
        await route.fulfill({
          contentType: "text/html",
          body: "<h1>Canonical landing page</h1>",
        })
      })
      await logo.click()
      await expect(
        page.getByRole("heading", { name: "Canonical landing page" }),
      ).toBeVisible()
      await expect(page).toHaveURL(`${appUrl}/`)
    })
  }
}

test("SPA home fallback loads the canonical site and preserves query and hash", async ({
  page,
}) => {
  const destination = "https://tscircuit.com/?utm_source=test#features"
  await page.route("https://tscircuit.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Canonical landing page</h1>",
    }),
  )
  await page.goto(`${appUrl}/?utm_source=test#features`)
  await expect(page).toHaveURL(destination)
  await expect(
    page.getByRole("heading", { name: "Canonical landing page" }),
  ).toBeVisible()
})
