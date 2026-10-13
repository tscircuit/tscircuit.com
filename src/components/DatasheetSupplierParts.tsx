import { ExternalLink } from "lucide-react"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"
import { getDatasheetSupplierLinks } from "@/lib/datasheet-suppliers"

export const DatasheetSupplierParts = ({
  datasheet,
}: { datasheet: DatasheetWithPinAttributes }) => {
  const suppliers = getDatasheetSupplierLinks(datasheet)
  if (!suppliers.length) return null
  return (
    <nav
      aria-label="Suppliers"
      className="flex shrink-0 flex-wrap justify-end gap-4 text-sm font-medium md:pt-2"
    >
      {suppliers.map((supplier) => (
        <a
          key={supplier.name}
          href={supplier.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          {supplier.name}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}
