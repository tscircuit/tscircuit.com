import { DatasheetFootprint } from "@/components/DatasheetFootprint"
import { DatasheetSchematicSymbol } from "@/components/DatasheetSchematicSymbol"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  if (!hasDatasheetSchematicSymbol(datasheet)) {
    if (!hasFootprint) return null
    return (
      <DatasheetFootprint
        chipName={chipName}
        footprinterString={datasheet.footprinter_string}
      />
    )
  }

  return (
    <Tabs key={chipName} defaultValue="footprint">
      <TabsList aria-label="Datasheet views">
        <TabsTrigger value="footprint">Footprint</TabsTrigger>
        <TabsTrigger value="schematic">Schematic</TabsTrigger>
      </TabsList>
      <TabsContent value="footprint">
        {hasFootprint ? (
          <DatasheetFootprint
            chipName={chipName}
            footprinterString={datasheet.footprinter_string}
          />
        ) : (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No footprint available.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      <TabsContent value="schematic">
        <DatasheetSchematicSymbol chipName={chipName} datasheet={datasheet} />
      </TabsContent>
    </Tabs>
  )
}
