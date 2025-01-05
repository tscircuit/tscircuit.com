import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5177/editor?snippet_id=snippet_3")
  await page.getByRole("button", { name: "Log in" }).click()
  await page.locator('[id="radix-\\:ri:"]').click()
  await page.waitForTimeout(2000)
  await page.getByRole("menuitem", { name: "Edit Description" }).click()
  await page.getByPlaceholder("Enter new description").press("End")
  await page
    .getByPlaceholder("Enter new description")
    .fill("Check out this new description")
  await page.getByRole("button", { name: "Update" }).click()
  await page.locator('[id="radix-\\:ri\\:"]').click()
  await page.waitForTimeout(2000)
  await page.getByRole("menuitem", { name: "Edit Description" }).click()
  await expect(page).toHaveScreenshot("update-description.png")
})
