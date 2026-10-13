import type { DatasheetWithPinAttributes } from "./datasheet-pin-display"

type SupplierFields = Pick<DatasheetWithPinAttributes, "supplier_part_numbers">

export const getDatasheetSupplierLinks = (datasheet: SupplierFields) => {
  const suppliers = [
    {
      name: "JLCPCB",
      partNumbers: datasheet.supplier_part_numbers?.jlcpcb ?? [],
      url: (part: string) =>
        `https://jlcpcb.com/partdetail/${encodeURIComponent(part)}`,
    },
    {
      name: "DigiKey",
      partNumbers: datasheet.supplier_part_numbers?.digikey ?? [],
      url: (part: string) =>
        `https://www.digikey.com/en/products?keywords=${encodeURIComponent(part)}`,
    },
    {
      name: "Mouser",
      partNumbers: datasheet.supplier_part_numbers?.mouser ?? [],
      url: (part: string) =>
        `https://www.mouser.com/c/?q=${encodeURIComponent(part)}`,
    },
  ]
  return suppliers.flatMap(({ name, partNumbers, url }) => {
    const part = partNumbers.map((part) => part.trim()).find(Boolean)
    return part ? [{ name, partNumber: part, href: url(part) }] : []
  })
}
