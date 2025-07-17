import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { saveAs } from "file-saver"

export const downloadSchematicSvg = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const svg = convertCircuitJsonToSchematicSvg(circuitJson)
  const blob = new Blob([svg], { type: "image/svg" })
  saveAs(blob, `${fileName}.svg`)
}
