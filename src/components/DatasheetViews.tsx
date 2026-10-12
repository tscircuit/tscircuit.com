import { DatasheetFootprint } from "@/components/DatasheetFootprint"
import { DatasheetSchematicSymbol } from "@/components/DatasheetSchematicSymbol"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"
import { hasDatasheetSchematicSymbol } from "@/lib/datasheet-schematic-symbol"

export const DatasheetViews = ({
  chipName,
  datasheet,
}: {
  chipName: string
  datasheet: DatasheetWithPinAttributes
}) => {
  const hasFootprint = Boolean(datasheet.footprinter_string?.trim())
  const hasSymbol = hasDatasheetSchematicSymbol(datasheet)
  if (!hasFootprint && !hasSymbol) return null

  return (
    <div
      className={`grid gap-x-6 ${hasFootprint && hasSymbol ? "lg:grid-cols-2" : ""}`}
    >
      {hasFootprint && (
        <div className="min-w-0">
          <DatasheetFootprint
            chipName={chipName}
            footprinterString={datasheet.footprinter_string}
            paired={hasSymbol}
          />
        </div>
      )}
      {hasSymbol && (
        <div className="min-w-0">
          <DatasheetSchematicSymbol chipName={chipName} datasheet={datasheet} />
        </div>
      )}
    </div>
  )
}
