 import { test, expect } from "@playwright/test"                                                                           
 import { viewports } from "./viewports"                                                                                   
                                                                                                                           
 for (const [size, viewport] of Object.entries(viewports)) {                                                               
   test.describe(`FootprintDialog tests - ${size} viewport`, () => {                                                       
     test.beforeEach(async ({ page }) => {                                                                                 
       await page.setViewportSize(viewport)                                                                                
       // Navigate to a page where we can access the footprint dialog                                                      
       await page.goto("http://127.0.0.1:5177/editor")                                                                     
       // Wait for the page to load                                                                                        
       await page.waitForSelector("button.run-button")                                                                     
     })                                                                                                                    
                                                                                                                           
     test("opens footprint dialog and shows preview", async ({ page }) => {                                                
       // Open the dialog (assuming there's a button to open it)                                                           
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Check if dialog is visible                                                                                       
       await expect(page.getByRole("dialog")).toBeVisible()                                                                
                                                                                                                           
       // Verify dialog title                                                                                              
       await expect(page.getByRole("heading", { name: "Insert Chip" })).toBeVisible()                                      
     })                                                                                                                    
                                                                                                                           
     test("footprint selection and preview updates", async ({ page }) => {                                                 
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Select a footprint from the combobox                                                                             
       await page.click('input[placeholder="Select footprint..."]')                                                        
       await page.click('text=ms012') // Assuming DIP8 is one of the options                                                
                                                                                                                           
       // Verify preview SVG appears                                                                                       
       await expect(page.locator("svg")).toBeVisible()                                                                     

       // Take a screenshot of the preview                                                                                 
       await expect(page).toHaveScreenshot(`footprint-preview-${size}.png`)                                                
     })                                                                                                                    
                                                                                                                           
     test("chip name and position inputs", async ({ page }) => {                                                           
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Fill in chip name                                                                                                
       await page.fill('input[placeholder="Enter chip name (e.g., U1)..."]', "U1")                                         
                                                                                                                           
       // Set position                                                                                                     
       await page.fill('label:has-text("x:") input', "100")                                                                
       await page.fill('label:has-text("y:") input', "50")                                                                 
                                                                                                                           
       // Verify values are set                                                                                            
       await expect(page.locator('input[placeholder="Enter chip name (e.g., U1)..."]')).toHaveValue("U1")                  
       await expect(page.locator('label:has-text("x:") input')).toHaveValue("100")                                         
       await expect(page.locator('label:has-text("y:") input')).toHaveValue("50")                                          
     })                                                                                                                    
                                                                                                                           
     test("footprint string updates and copy functionality", async ({ page }) => {                                         
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Select a footprint                                                                                               
       await page.click('input[placeholder="Select footprint..."]')                                                        
       await page.click('text=ms012')                                                                                       
                                                                                                                           
       // Verify footprint string is not empty                                                                             
       const footprintInput = page.locator('input[placeholder="Complete footprint string..."]')                            
       await expect(footprintInput).not.toHaveValue("")                                                                    
                                                                                                                           
       // Test copy button                                                                                                 
       await page.click('button[title="Copy to clipboard"]')                                                               
                                                                                                                           
       // Verify copy icon changes to check mark                                                                           
       await expect(page.locator('svg.lucide-check')).toBeVisible()                                                        
     })                                                                                                                    
                                                                                                                           
     test("inserts footprint into code", async ({ page }) => {                                                             
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Fill required fields                                                                                             
       await page.fill('input[placeholder="Enter chip name (e.g., U1)..."]', "U1")                                         
       await page.click('input[placeholder="Select footprint..."]')                                                        
       await page.click('text=ms012')                                                                                       
                                                                                                                           
       // Click insert button                                                                                              
       await page.click('button:has-text("Insert Footprint")')                                                             
                                                                                                                           
       // Verify dialog closes                                                                                             
       await expect(page.getByRole("dialog")).not.toBeVisible()                                                            
                                                                                                                           
       // Verify code was inserted (assuming we can see the code editor)                                                   
       const editorContent = await page.locator('.monaco-editor').textContent()                                            
       expect(editorContent).toContain('<chip')                                                                            
       expect(editorContent).toContain('name="U1"')                                                                        
     })                                                                                                                    
                                                                                                                           
     test("parameter controls update preview", async ({ page }) => {                                                       
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Select a footprint                                                                                               
       await page.click('input[placeholder="Select footprint..."]')                                                        
       await page.click('text=ms012')                                                                                       
                                                                                                                           
       // Get initial preview state                                                                                        
       const initialPreview = await page.locator("svg").innerHTML()                                                        
                                                                                                                           
       // Modify a parameter (e.g., number of pins)                                                                        
       await page.fill('label:has-text("Number of Pins") input', "16")                                                     
                                                                                                                           
       // Wait for preview to update                                                                                       
       await page.waitForTimeout(500)                                                                                      
                                                                                                                           
       // Get updated preview state                                                                                        
       const updatedPreview = await page.locator("svg").innerHTML()                                                        
                                                                                                                           
       // Verify preview changed                                                                                           
       expect(initialPreview).not.toEqual(updatedPreview)                                                                  
     })                                                                                                                    
                                                                                                                           
     test("handles invalid footprint names", async ({ page }) => {                                                         
       await page.click('button:has-text("Insert Chip")')                                                                  
                                                                                                                           
       // Enter invalid footprint                                                                                          
       await page.fill('input[placeholder="Select footprint..."]', "InvalidFootprint")                                     
                                                                                                                           
       // Verify error state                                                                                               
       await expect(page.locator('input[placeholder="Complete footprint string..."]'))                                     
         .toHaveClass(/bg-red-50/)                                                                                         
     })                                                                                                                    
   })                                                                                                                      
 }        
