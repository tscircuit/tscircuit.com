import { createSvgUrl } from "@tscircuit/create-snippet-url"
import {
  getDatasheetSchematicSource,
  type DatasheetComponentData,
} from "@tscircuit/parts-engine/datasheet-component-tsx"

export { getDatasheetSchematicSource }

type SchematicDatasheet = DatasheetComponentData

export const hasDatasheetSchematicSymbol = (datasheet: SchematicDatasheet) =>
  Boolean(
    datasheet.symbol_tsx?.trim() ||
      datasheet.builtin_symbol_name?.trim() ||
      datasheet.sch_pin_arrangement,
  )

export const getDatasheetSchematicSvgUrl = (datasheet: SchematicDatasheet) => {
  const source = getDatasheetSchematicSource(datasheet)
  return source ? createSvgUrl(source, "schematic") : null
}
