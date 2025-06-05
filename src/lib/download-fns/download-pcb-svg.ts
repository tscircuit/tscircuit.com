import { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { saveAs } from "file-saver"

export const downloadPcbSvg = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
const blob = new Blob([svg], { type: "image/svg+xml" })
  saveAs(blob, fileName + ".svg")
}
