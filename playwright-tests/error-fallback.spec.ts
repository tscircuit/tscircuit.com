import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test(`ErrorFallback Component on ${size} screen`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const isMobileOrTablet = viewport.width <= 768

    // Go to editor
    await page.goto("http://127.0.0.1:5177/editor")

    if (isMobileOrTablet) {
      await page.click('button:has-text("Show Code")')
    }

    // Click editor and insert the invalid chip code
    await page.locator(".cm-content").click()
    await page.keyboard.press("Home")

    await page.keyboard.type(`    <chip                                                                                   
       name="3"                                                                                                            
       cadModel={{                                                                                                         
         jscad: {                                                                                                          
           type: "cube",                                                                                                   
           size: -1,                                                                                                       
         }}}                                                                                                               
       footprint="ms012"                                                                                                   
     />`)

    if (isMobileOrTablet) {
      await page.click('button:has-text("Show Preview")')
    }

    // Run to trigger 3D viewer error
    await page.click(".run-button")

    // Switch to 3D tab
    await page.click("text=3D")

    // Wait for error to appear
    await page.waitForSelector('[data-testid="error-container"]')

    // Verify error message is present
    const errorMessage = await page.locator(".error-container p").textContent()
    expect(errorMessage).toBeTruthy()

    // Take screenshot of the error state
    await expect(page).toHaveScreenshot(`error-fallback-${size}.png`)
  })
}
