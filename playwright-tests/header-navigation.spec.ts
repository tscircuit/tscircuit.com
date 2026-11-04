import { expect, test } from "@playwright/test"

const baseUrl = "http://127.0.0.1:5177"

for (const path of [
  "/professional-support",
  "/verified-chips",
  "/datasheets",
  "/search",
  "/missing/page/route",
]) {
  test(`header typography and immediate dropdowns on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${baseUrl}${path}`)
    const nav = page.getByRole("navigation", { name: "Primary navigation" })
    const product = nav
      .locator("details")
      .filter({ hasText: "Online Playground" })
    const solutions = nav
      .locator("details")
      .filter({ hasText: "Professional Support" })
    await expect(nav).toHaveCSS("font-family", "Geist, system-ui, sans-serif")
    await expect(nav).toHaveCSS("font-weight", "500")
    await expect(page.getByRole("link", { name: "tscircuit home" })).toHaveCSS(
      "font-weight",
      "600",
    )
    await product.locator("summary").hover()
    await expect(
      product.getByRole("link", { name: "Datasheets", exact: true }),
    ).toBeVisible()
    await expect(product.locator(".header-nav-panel")).toHaveCSS(
      "animation-name",
      "none",
    )
    // Closing must happen in the pointer handler, without waiting for a timer.
    expect(
      await product.evaluate((element: HTMLDetailsElement) => {
        element.dispatchEvent(new PointerEvent("pointerleave"))
        return element.open
      }),
    ).toBe(false)
    await solutions.locator("summary").hover()
    await expect(
      solutions.getByRole("link", {
        name: "Professional Support",
        exact: true,
      }),
    ).toBeVisible()
    await expect(product).not.toHaveAttribute("open")
    // The space between trigger and panel must preserve the hovered menu.
    const bounds = await solutions.boundingBox()
    if (!bounds) throw new Error("Solutions trigger is missing")
    await page.mouse.move(bounds.x + 20, bounds.y + bounds.height + 5)
    await expect(solutions).toHaveAttribute("open")
    await solutions
      .getByRole("link", { name: "Professional Support", exact: true })
      .focus()
    await page.keyboard.press("Escape")
    await expect(solutions).not.toHaveAttribute("open")
    await expect(solutions.locator("summary")).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(solutions).toHaveAttribute("open")
    await page.getByRole("heading", { level: 1 }).click()
    await expect(solutions).not.toHaveAttribute("open")
  })
}

test("mobile menus keep landing-page text weights and support touch/click", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(`${baseUrl}/professional-support`)
  await page.getByRole("button", { name: "Open menu", exact: true }).click()
  const nav = page.getByRole("navigation", { name: "Primary navigation" })
  await expect(nav).toHaveCSS("font-weight", "400")
  const product = nav
    .locator("details")
    .filter({ hasText: "Online Playground" })
  const solutions = nav
    .locator("details")
    .filter({ hasText: "Professional Support" })
  await product.locator("summary").click()
  await expect(
    product.getByRole("link", { name: "Datasheets", exact: true }),
  ).toBeVisible()
  await solutions.locator("summary").click()
  await expect(product).not.toHaveAttribute("open")
  await solutions
    .getByRole("link", { name: "Verified Chips Program", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Verified Chips Program", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Open menu", exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test("New menu uses the same font without opening animations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${baseUrl}/professional-support`)
  const trigger = page.getByRole("button", { name: "New", exact: true })
  await expect(trigger).toHaveCSS("font-size", "14px")
  await trigger.click()
  const menu = page.locator(".site-header-menu")
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS("font-family", "Geist, system-ui, sans-serif")
  await expect(menu).toHaveCSS("font-weight", "500")
  await expect(menu).toHaveCSS("animation-name", "none")
  await page.keyboard.press("Escape")
  await expect(menu).not.toBeVisible()
})
