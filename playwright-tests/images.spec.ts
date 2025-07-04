import { expect, test } from "@playwright/test"

test(`Pcb Image`, async ({ page }) => {
  await page.goto(
    "http://127.0.0.1:5177/api/snippets/images/testuser/my-test-board/pcb.svg",
  )
  await page.waitForLoadState("networkidle")
  await expect(page).toHaveScreenshot(`pcb-image.png`)
})

test(`Schematic Image`, async ({ page }) => {
  await page.goto(
    "http://127.0.0.1:5177/api/snippets/images/testuser/my-test-board/schematic.svg",
  )
  await page.waitForLoadState("networkidle")
  await expect(page).toHaveScreenshot(`schematic-image.png`)
})
