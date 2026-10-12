import { test, expect } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { DatasheetSupplierParts } from "@/components/DatasheetSupplierParts"
import { getDatasheetSupplierLinks } from "@/lib/datasheet-suppliers"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"

test("supplier links show stored numbers, encode searches and omit unavailable suppliers", () => {
  const parts = {
    jlc_part_number: " C12345 ",
    digikey_part_number: "123/EXAMPLE+ND",
    mouser_part_number: "123-EXAMPLE & KIT",
  }
  const links = getDatasheetSupplierLinks(parts)
  expect(links.map((link) => link.name)).toEqual([
    "JLCPCB",
    "DigiKey",
    "Mouser",
  ])
  expect(links[0].href).toBe("https://jlcpcb.com/partdetail/C12345")
  expect(new URL(links[1].href).searchParams.get("keywords")).toBe(
    parts.digikey_part_number,
  )
  expect(new URL(links[2].href).searchParams.get("q")).toBe(
    parts.mouser_part_number,
  )
  expect(
    getDatasheetSupplierLinks({
      jlc_part_number: null,
      mouser_part_number: "  ",
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
  expect(markup).toContain("Supplier part numbers")
  expect(markup).toContain('rel="noopener noreferrer"')
  expect(markup).toContain('target="_blank"')
})
