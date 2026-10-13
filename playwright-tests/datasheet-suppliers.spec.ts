import { test, expect } from "@playwright/test"

const parts = {
  jlcpcb: ["C12345", "C54321"],
  digikey: ["123-EXAMPLE-ND"],
  mouser: ["123-EXAMPLE"],
  lcsc: ["C999"],
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
          supplier_part_numbers: parts,
          generated_tsx:
            'export default () => <chip name="U1" supplierPartNumbers={{other:["OTHER"]}} />',
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/datasheets/SUPPLIER-EXAMPLE")
  const jlc = page.getByRole("link", {
    name: `JLCPCB ${parts.jlcpcb[0]}`,
    exact: true,
  })
  await expect(jlc).toHaveAttribute(
    "href",
    "https://jlcpcb.com/partdetail/C12345",
  )
  await expect(
    page.getByRole("link", {
      name: `DigiKey ${parts.digikey[0]}`,
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    `https://www.digikey.com/en/products?keywords=${parts.digikey[0]}`,
  )
  await expect(
    page.getByRole("link", {
      name: `Mouser ${parts.mouser[0]}`,
      exact: true,
    }),
  ).toHaveAttribute("href", `https://www.mouser.com/c/?q=${parts.mouser[0]}`)
  await expect(jlc).toHaveAttribute("target", "_blank")
  await page
    .getByRole("button", { name: "Copy component TSX", exact: true })
    .click()
  const copied = await page.evaluate(() => (window as any).copiedTsx)
  expect(copied).toContain('"jlcpcb":["C12345","C54321"]')
  expect(copied).toContain('"digikey":["123-EXAMPLE-ND"]')
  expect(copied).toContain('"mouser":["123-EXAMPLE"]')
  expect(copied).not.toContain('other:["OTHER"]')
  expect(copied).toContain('"lcsc":["C999"]')
  await expect(
    page.getByRole("link", { name: "JLCPCB C54321", exact: true }),
  ).toHaveAttribute("href", "https://jlcpcb.com/partdetail/C54321")
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
          supplier_part_numbers: null,
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
