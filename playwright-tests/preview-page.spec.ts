import { expect, test } from "@playwright/test"

test(`preview-snippet Page`, async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/preview?snippet_id=snippet_5")
  await page.waitForTimeout(20000)
  await expect(page).toHaveScreenshot(`preview-snippet-pcb.png`)
})
