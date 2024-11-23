import { test, expect } from "@playwright/test"                                                                           
 import { viewports } from "./viewports"                                                                                   
                                                                                                                           
 for (const [size, viewport] of Object.entries(viewports)) {                                                               
   test(`ErrorFallback Component on ${size} screen`, async ({ page }) => {                                                 
     await page.setViewportSize(viewport)                                                                                  
                                                                                                                           
     // Go to editor                                                                                                       
     await page.goto("http://127.0.0.1:5177/editor")                                                                       
                                                                                                                           
     // Click insert to open footprint dialog                                                                              
     await page.click('button:has-text("Insert")')                                                                         
                                                                                                                           
     // Fill in chip name                                                                                                  
     await page.fill('input[placeholder="Enter chip name (e.g., U1)..."]', "U1")                                           
                                                                                                                           
     // Select dfn footprint                                                                                               
     await page.getByRole("combobox").click()                                                                              
     await page.getByRole("option", { name: "dfn" }).click()                                                               
                                                                                                                           
     // Insert the footprint                                                                                               
     await page.click('button:has-text("Insert Footprint")')                                                               
                                                                                                                           
     // Find and modify the dfn text                                                                                       
     const content = await page.locator(".cm-content").textContent()                                                       
     const dfnIndex = content.indexOf("dfn")                                                                               
                                                                                                                           
     await page.locator(".cm-content").click()                                                                             
     await page.keyboard.press("PageUp")                                                                                   
     await page.keyboard.press("Home")                                                                                     
                                                                                                                           
     for (let i = 0; i <= dfnIndex + 9; i++) {                                                                             
       await page.keyboard.press("ArrowRight")                                                                             
     }                                                                                                                     
     await page.keyboard.type("-1")                                                                                        
                                                                                                                           
     // Run to trigger 3D viewer error                                                                                     
     await page.click(".run-button")                                                                                       
                                                                                                                           
     // Wait for error to appear                                                                                           
     await page.waitForSelector('[data-testid="error-container"]')                                                         
                                                                                                                           
     // Verify error message is present                                                                                    
     const errorMessage = await page.locator(".error-container p").textContent()                                           
     expect(errorMessage).toBeTruthy()                                                                                     
                                                                                                                           
     // Take screenshot of the error state                                                                                 
     await expect(page).toHaveScreenshot(`error-fallback-${size}.png`)                                                     
   })                                                                                                                      
 }                                                                                                                         
        
