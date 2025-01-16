import { test, expect } from "@playwright/test"

test.skip("Manual edits test", async ({ page }) => {
  test.setTimeout(60000) // Extend timeout for the test

  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_3")
  // await page.waitForLoadState("networkidle")

  const loginButton = page.getByRole("button", { name: "Log in" })
  // await loginButton.waitFor({ state: "visible" })
  await loginButton.click()

  const editorTextbox = page.getByRole("textbox").first()
  // await editorTextbox.waitFor({ state: "visible" })
  await editorTextbox.click()

  await page.keyboard.press("Control+A")
  await page.keyboard.press("Backspace")

  const indexCode = `import { A555Timer } from "@tsci/seveibar.a555timer"
  import manualEdits from "./manual-edits.json"

  export default () => (
    <board width="10mm" height="10mm" manualEdits={manualEdits}>
      <A555Timer name="U1" />
    </board>
  )`

  await editorTextbox.fill(indexCode)

  const combobox = page.getByRole("combobox")
  await combobox.click()

  const fileOption = page.getByText("manual-edits.json", { exact: true })
  // await fileOption.waitFor({ state: "visible" })
  await fileOption.click()

  await page.getByRole("textbox").first().click()
  await page.keyboard.press("Control+A")
  await page.keyboard.press("Backspace")

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
  }
`

  await page.keyboard.type(pcbPlacementsData)

  const runButton = page.getByRole("button", { name: "Run", exact: true })
  // await runButton.waitFor({ state: "visible" })
  await runButton.click()

  const saveButton = page.getByRole("button", { name: "Save" })
  // await saveButton.waitFor({ state: "visible", timeout: 20000 }) // Extend timeout for Save button
  await saveButton.click()

  await page.waitForTimeout(1000)

  await expect(page).toHaveScreenshot("editor-manual-edits.png")

  await page.goto("http://127.0.0.1:5177/testuser/my-test-board", {
    waitUntil: "domcontentloaded",
  })

  await page.waitForLoadState("networkidle")

  const filesLink = page.getByRole("link", { name: "Files" })
  // await filesLink.waitFor({ state: "visible" })
  await filesLink.click()
  await page.getByLabel("Files").click()

  const fileLink = page.getByText("manual-edits.json", { exact: true })
  // await fileLink.waitFor({ state: "visible" })
  await fileLink.click()

  await expect(page).toHaveScreenshot("manual-edits-view.png")
})
