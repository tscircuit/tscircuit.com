import { test, expect } from "@playwright/test"

test("Editor loads snippet correctly", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_5")

  await page.waitForLoadState("networkidle")

  await expect(page.getByText("SquareWaveModule")).toBeVisible()

  const pagePromise = page.waitForEvent('popup');

  await page.getByText('@tsci/seveibar.a555timer').click({
    modifiers: ['ControlOrMeta']
  });
  const page1 = await pagePromise;

  // Wait for the new page to be fully loaded
  await page1.waitForLoadState('load')
  await page1.waitForLoadState('domcontentloaded')
  await page1.waitForLoadState('networkidle')

  await expect(page1).toHaveScreenshot("ctrl-click-definition.png")
})