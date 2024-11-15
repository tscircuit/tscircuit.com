import { test, expect } from "@playwright/test"

test("test for starring a repo", async ({ page }) => {
    await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
    await page.getByRole('button', { name: 'Fake testuser Login' }).click();

    await page.waitForLoadState("networkidle")

    // Check for initial page content
    await expect(page.getByText('testuser/my-test-boardBOARD')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Star' })).toBeVisible()

    // add star
    await page.click('button:has-text("Star")')
    await page.waitForTimeout(3000)

    await expect(page).toHaveScreenshot("star-button.png")
})

test("test for removing a star from a repo", async ({ page }) => {
    await page.goto("http://127.0.0.1:5177/testuser/my-test-board")
    await page.getByRole('button', { name: 'Fake testuser Login' }).click();

    await page.waitForLoadState("networkidle")

    // Check for initial page content
    await expect(page.getByText('testuser/my-test-boardBOARD')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Star' })).toBeVisible()

    // remove star
    await page.click('button:has-text("Star")')
    await page.waitForTimeout(3000)

    await expect(page).toHaveScreenshot("remove-star-button.png")
})