import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { convertCircuitJsonToReadableNetlist } from "circuit-json-to-readable-netlist"

export const downloadReadableNetlist = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const readableNetlistString = convertCircuitJsonToReadableNetlist(circuitJson)
  const blob = new Blob([readableNetlistString], { type: "text/plain" })
  saveAs(blob, fileName + ".txt")
}
