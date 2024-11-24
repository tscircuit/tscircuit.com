import { expect, test } from "@playwright/test"

test(`preview-snippet Page`, async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/preview?snippet_id=snippet_5&view=pcb")
  await page.waitForSelector("canvas")
  await expect(page).toHaveScreenshot(`preview-snippet-pcb.png`)

  await page.goto(
    "http://127.0.0.1:5177/preview?snippet_id=snippet_5&view=schematic",
  )
  // Wait for schematic viewer to load
  await page.waitForSelector("rect")
  await expect(page).toHaveScreenshot(`preview-snippet-schematic.png`)
})
