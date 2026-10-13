import { test, expect } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { DatasheetSupplierParts } from "@/components/DatasheetSupplierParts"
import { getDatasheetSupplierLinks } from "@/lib/datasheet-suppliers"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"

test("supplier name links use the first available number and omit unavailable suppliers", () => {
  const parts = {
    supplier_part_numbers: {
      jlcpcb: [" C12345 ", "C54321"],
      digikey: ["123/EXAMPLE+ND"],
      mouser: ["123-EXAMPLE & KIT"],
    },
  }
  const links = getDatasheetSupplierLinks(parts)
  expect(links.map((link) => link.name)).toEqual([
    "JLCPCB",
    "DigiKey",
    "Mouser",
  ])
  expect(links[0].href).toBe("https://jlcpcb.com/partdetail/C12345")
  expect(new URL(links[1].href).searchParams.get("keywords")).toBe(
    parts.supplier_part_numbers.digikey[0],
  )
  expect(new URL(links[2].href).searchParams.get("q")).toBe(
    parts.supplier_part_numbers.mouser[0],
  )
  expect(
    getDatasheetSupplierLinks({
      supplier_part_numbers: { jlcpcb: [], mouser: ["  "] },
    }),
  ).toEqual([])
  expect(
    renderToStaticMarkup(
      <DatasheetSupplierParts datasheet={{} as DatasheetWithPinAttributes} />,
    ),
  ).toBe("")
  const markup = renderToStaticMarkup(
    <DatasheetSupplierParts datasheet={parts as DatasheetWithPinAttributes} />,
  )
  expect(markup).toContain('aria-label="Suppliers"')
  expect(markup).toContain("JLCPCB")
  expect(markup).not.toContain(">C12345<")
  expect(markup).not.toContain("C54321")
  expect(markup).toContain('rel="noopener noreferrer"')
  expect(markup).toContain('target="_blank"')
})
