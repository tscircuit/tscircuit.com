import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"
import { getDatasheetSupplierLinks } from "@/lib/datasheet-suppliers"

export const DatasheetSupplierParts = ({
  datasheet,
}: { datasheet: DatasheetWithPinAttributes }) => {
  const suppliers = getDatasheetSupplierLinks(datasheet)
  if (!suppliers.length) return null
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          Supplier part numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier.name} className="min-w-0">
              <dt className="mb-1 text-sm font-medium text-gray-600">
                {supplier.name}
              </dt>
              <dd>
                <a
                  href={supplier.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-start gap-1 text-blue-600 hover:underline"
                  aria-label={`${supplier.name} ${supplier.partNumber}`}
                >
                  <span className="min-w-0 break-all">
                    {supplier.partNumber}
                  </span>
                  <ExternalLink
                    className="mt-1 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
