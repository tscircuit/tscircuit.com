import { expect, test } from "@playwright/test"

test("Handle manual edits test", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_3")

  await page.getByRole("button", { name: "Log in" }).click()

  const combobox = page.getByRole("combobox")
  await combobox.waitFor({ state: "visible" })
  await combobox.click()

  const manualEditsFile = page.getByText("manual-edits.json", { exact: true })
  await manualEditsFile.waitFor({ state: "visible" })
  await manualEditsFile.click()

  await page.locator("div").filter({ hasText: /^91›$/ }).first().click()

  const pcbPlacementsData = `{
    "pcb_placements": [
      {
        "selector": "U1",
        "center": {
          "x": -26.03275345576554,
          "y": 23.735745797903878
        },
        "relative_to": "group_center",
        "_edit_event_id": "0.5072961258141278"
      }
    ],
    "edit_events": [],
    "manual_trace_hints": []
  }`

  await page.keyboard.type(pcbPlacementsData)

  await combobox.click()

  const indexFile = page.getByText("index.tsx", { exact: true })
  await indexFile.waitFor({ state: "visible" })
  await indexFile.click()

  await page.getByRole("button", { name: "Error" }).click()
  await page
    .getByRole("menuitem", { name: "Manual edits exist but have" })
    .click()
  await page.waitForTimeout(500)

  const runButton = page.getByRole("button", { name: "Run", exact: true })
  await runButton.waitFor({ state: "visible" })
  await runButton.click()

  await page.waitForTimeout(2000)

  await expect(page).toHaveScreenshot("handle-manual-edits.png")
})
