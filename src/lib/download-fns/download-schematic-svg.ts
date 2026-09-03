import { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToStackedSchematicSheetsSvg } from "circuit-to-svg"
import { saveAs } from "file-saver"

export const downloadSchematicSvg = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const svg = convertCircuitJsonToStackedSchematicSheetsSvg(circuitJson)
  const blob = new Blob([svg], { type: "image/svg+xml" })
  saveAs(blob, fileName + ".svg")
}
