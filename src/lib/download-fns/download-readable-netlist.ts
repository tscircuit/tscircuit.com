import { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToReadableNetlist } from "circuit-json-to-readable-netlist"
import { saveAs } from "file-saver"

export const downloadReadableNetlist = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const readableNetlistString = convertCircuitJsonToReadableNetlist(circuitJson)
  const blob = new Blob([readableNetlistString], { type: "text/plain" })
  saveAs(blob, fileName + ".txt")
}
