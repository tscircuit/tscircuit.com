import { test, expect } from "@playwright/test"

test("Editor handles imports with underlining and cmd+click", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_3")

  await page.waitForLoadState("networkidle")

  // Wait for and verify the underlined import
  const underlinedText = await page.locator(".cm-underline")
  await expect(underlinedText).toBeVisible()

  // Verify the styling matches our expectations
  const styles = await underlinedText.evaluate((el) => {
    const computed = window.getComputedStyle(el)
    return {
      textDecoration: computed.textDecoration,
      cursor: computed.cursor,
    }
  })

  expect(styles.textDecoration).toContain("underline")
  expect(styles.cursor).toBe("pointer")

  // Test cmd+click behavior
  const popupPromise = page.waitForEvent("popup")
  await underlinedText.click({
    modifiers: process.platform === "darwin" ? ["Meta"] : ["Control"],
  })

  // Verify new tab opens with correct URL
  const popup = await popupPromise
  const popupUrl = popup.url()

  // URL validation
  expect(popupUrl).toMatch(
    /^http:\/\/127\.0\.0\.1:5177\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/,
  )

  // Take a snapshot of the editor showing underlined imports
  await expect(page).toHaveScreenshot("underlined-imports.png")
})
