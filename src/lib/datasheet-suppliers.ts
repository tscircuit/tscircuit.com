import type { DatasheetWithPinAttributes } from "./datasheet-pin-display"

type SupplierFields = Pick<
  DatasheetWithPinAttributes,
  "jlc_part_number" | "digikey_part_number" | "mouser_part_number"
>

export const getDatasheetSupplierLinks = (datasheet: SupplierFields) => {
  const suppliers = [
    {
      name: "JLCPCB",
      partNumber: datasheet.jlc_part_number,
      url: (part: string) =>
        `https://jlcpcb.com/partdetail/${encodeURIComponent(part)}`,
    },
    {
      name: "DigiKey",
      partNumber: datasheet.digikey_part_number,
      url: (part: string) =>
        `https://www.digikey.com/en/products?keywords=${encodeURIComponent(part)}`,
    },
    {
      name: "Mouser",
      partNumber: datasheet.mouser_part_number,
      url: (part: string) =>
        `https://www.mouser.com/c/?q=${encodeURIComponent(part)}`,
    },
  ]
  return suppliers.flatMap(({ name, partNumber, url }) => {
    const part = partNumber?.trim()
    return part ? [{ name, partNumber: part, href: url(part) }] : []
  })
}
