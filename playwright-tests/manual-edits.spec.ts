import { test, expect } from "@playwright/test";

test("Manual edits test", async ({ page }) => {
  await page.goto("http://127.0.0.1:5177/editor?snippet_id=snippet_5");
  await page.waitForLoadState("networkidle");

  const loginButton = page.getByRole("button", { name: "Fake testuser Login" });
  await loginButton.waitFor({ state: "visible" });
  await loginButton.click();

  const combobox = page.getByRole("combobox");
  await combobox.waitFor({ state: "visible" });
  await combobox.click();
  
  const fileOption = page.getByText("manual-edits.json");
  await fileOption.waitFor({ state: "visible" });
  await fileOption.click();

  // Wait for file content to load
  await page.waitForLoadState("networkidle");

  const emptyPlacementsText = page.getByText('"pcb_placements": []');
  await emptyPlacementsText.waitFor({ state: "visible" });
  await emptyPlacementsText.click();

  await page.keyboard.press('Control+End');
  await page.keyboard.down('Shift');
  await page.keyboard.press('Control+Home');
  await page.keyboard.up('Shift');

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
  }`;

  await page.keyboard.type(pcbPlacementsData);

  // Wait for Run button and click
  const runButton = page.getByRole('button', { name: 'Run', exact: true });
  await runButton.waitFor({ state: "visible" });
  await runButton.click();
  
  // Wait for any animations/processing after Run
  await page.waitForLoadState("networkidle");

  // Wait for Save button and click
  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.waitFor({ state: "visible", timeout: 10000 });
  await saveButton.click();

  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot("editor-manual-edits.png");

  // Navigate to view page
  await page.goto("http://127.0.0.1:5177/testuser/a555timer-square-wave");
  await page.waitForLoadState("networkidle");

  const filesLink = page.getByRole("link", { name: "Files" });
  await filesLink.waitFor({ state: "visible" });
  await filesLink.click();

  const fileLink = page.getByText("manual-edits.json");
  await fileLink.waitFor({ state: "visible" });
  await fileLink.click();

  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("manual-edits-view.png");
});