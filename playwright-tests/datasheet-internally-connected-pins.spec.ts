import { test, expect } from "@playwright/test"

test("push button pins expose permanent pairs and copied TSX includes them", async ({
  page,
}) => {
  const generatedTsx =
    'export default () => <chip name="U1" pinLabels={{pin1:["A"],pin2:["B"],pin3:["C"],pin4:["D"]}} internallyConnectedPins={[["pin1","pin2"],["pin3","pin4"]]} />'
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          ;(window as any).copiedTsx = text
        },
      },
    }),
  )
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          chip_name: "TS-1187A-B-A-B",
          datasheet_pdf_urls: [],
          ai_description: "Normally-open momentary tactile switch",
          pin_information: ["A", "B", "C", "D"].map((pin_number) => ({
            pin_number,
            name: [pin_number],
            description: "Passive switch contact",
            capabilities: [],
          })),
          internally_connected_pins: [
            ["A", "B"],
            ["C", "D"],
          ],
          pin_attributes: null,
          generated_tsx: generatedTsx,
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/TS-1187A-B-A-B")
  await expect(page.getByLabel("Component TSX source")).toContainText(
    'internallyConnectedPins={[["pin1","pin2"],["pin3","pin4"]]}',
  )
  const rows = page.getByRole("row")
  await expect(
    rows.filter({
      has: page.getByRole("rowheader", { name: "A", exact: true }),
    }),
  ).toContainText("Internally connected to: B")
  await expect(
    rows.filter({
      has: page.getByRole("rowheader", { name: "C", exact: true }),
    }),
  ).toContainText("Internally connected to: D")
  await page
    .getByRole("button", { name: "Copy component TSX", exact: true })
    .click()
  expect(await page.evaluate(() => (window as any).copiedTsx)).toBe(
    generatedTsx,
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    page.getByText("Internally connected to: B", { exact: true }),
  ).toBeVisible()
  await page.getByRole("searchbox", { name: "Search pins" }).fill("B")
  await expect(
    page.getByRole("rowheader", { name: "A", exact: true }),
  ).toBeVisible()
})
