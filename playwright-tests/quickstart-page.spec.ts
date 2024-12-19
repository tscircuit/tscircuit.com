import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`Quickstart-Page on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto("http://127.0.0.1:5177/quickstart")

    await expect(page.getByText("USB-C LED Flashlight")).toBeVisible()
    await expect(page.getByRole("link", { name: /USB-C LED Flashlight/i })).toHaveAttribute("href", "/editor?template=usb-c-led-flashlight")

    await expect(page).toHaveScreenshot(`Quickstart-Page${size}.png`)
  })
}
