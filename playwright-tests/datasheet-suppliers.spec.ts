import { test, expect } from "@playwright/test"

const parts = {
  jlc_part_number: "C12345",
  digikey_part_number: "123-EXAMPLE-ND",
  mouser_part_number: "123-EXAMPLE",
}

test("shows supplier links and includes the same part numbers in copied component TSX", async ({
  page,
}) => {
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
          chip_name: "SUPPLIER-EXAMPLE",
          pin_information: [],
          datasheet_pdf_urls: [],
          ai_description: "Supplier example",
          ...parts,
          generated_tsx:
            'export default () => <chip name="U1" supplierPartNumbers={{other:["OTHER"]}} />',
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/SUPPLIER-EXAMPLE")
  const jlc = page.getByRole("link", {
    name: `JLCPCB ${parts.jlc_part_number}`,
    exact: true,
  })
  await expect(jlc).toHaveAttribute(
    "href",
    "https://jlcpcb.com/partdetail/C12345",
  )
  await expect(
    page.getByRole("link", {
      name: `DigiKey ${parts.digikey_part_number}`,
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `https://www.digikey.com/en/products?keywords=${parts.digikey_part_number}`,
  )
  await expect(
    page.getByRole("link", {
      name: `Mouser ${parts.mouser_part_number}`,
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `https://www.mouser.com/c/?q=${parts.mouser_part_number}`,
  )
  await expect(jlc).toHaveAttribute("target", "_blank")
  await page
    .getByRole("button", { name: "Copy component TSX", exact: true })
    .click()
  const copied = await page.evaluate(() => (window as any).copiedTsx)
  expect(copied).toContain('"jlcpcb":["C12345"]')
  expect(copied).toContain('"digikey":["123-EXAMPLE-ND"]')
  expect(copied).toContain('"mouser":["123-EXAMPLE"]')
  expect(copied).toContain('other:["OTHER"]')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(jlc).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
})

test("hides supplier links for missing and null values", async ({ page }) => {
  await page.route(/\/datasheets\/get\b/, (route) =>
    route.fulfill({
      json: {
        datasheet: {
          chip_name: "NO-SUPPLIERS",
          pin_information: [],
          datasheet_pdf_urls: [],
          ai_description: "No suppliers",
          jlc_part_number: null,
          digikey_part_number: null,
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/NO-SUPPLIERS")
  await expect(page.getByText("No suppliers", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Supplier part numbers", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("link", { name: /JLCPCB|DigiKey|Mouser/ }),
  ).toHaveCount(0)
})
