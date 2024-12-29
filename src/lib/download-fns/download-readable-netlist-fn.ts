import { convertCircuitJsonToReadableNetlist } from "circuit-json-to-readable-netlist"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"

export const downloadReadableNetlist = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const netlist = convertCircuitJsonToReadableNetlist({ elements: circuitJson })
  const blob = new Blob([netlist], { type: "text/plain" })
  saveAs(blob, fileName)
}
