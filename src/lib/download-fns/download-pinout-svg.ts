import { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPinoutSvg } from "circuit-to-svg"
import { saveAs } from "file-saver"

export const downloadPinoutSvg = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const svg = convertCircuitJsonToPinoutSvg(circuitJson)
  const blob = new Blob([svg], { type: "image/svg" })
  saveAs(blob, fileName + ".svg")
}
