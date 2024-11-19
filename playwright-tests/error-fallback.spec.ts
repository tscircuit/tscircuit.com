import { test, expect } from "@playwright/test"

test.describe("ErrorFallback Component", () => {
  test("displays error message and stack trace", async ({ page }) => {
    // Navigate to the page where the error occurs
    await page.goto("https://tscircuit.com/seveibar/smd-usb-c")

    // Wait for the ErrorFallback component to appear
    await page.waitForSelector('[data-testid="error-container"]', {
      timeout: 60000,
    })

    // Verify that the error message is displayed
    const errorMessage = await page.locator(".error-container p").textContent()
    expect(errorMessage).not.toBeNull()
    console.log("Error message:", errorMessage)

    // Verify that the stack trace is displayed
    const stackTrace = await page
      .locator(".error-container details")
      .textContent()
    expect(stackTrace).not.toBeNull()
    console.log("Stack trace:", stackTrace)

    // Take a screenshot of the error fallback for documentation
    await page
      .locator(".error-container")
      .screenshot({ path: "error-fallback-screenshot.png" })
  })
})
