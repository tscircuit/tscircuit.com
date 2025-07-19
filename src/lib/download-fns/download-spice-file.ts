import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { circuitJsonToSpice } from "circuit-json-to-spice"

export const downloadSpiceFile = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const spiceNetlist = circuitJsonToSpice(circuitJson)
  const spiceString = spiceNetlist.toSpiceString()
  const blob = new Blob([spiceString], { type: "text/plain" })
  saveAs(blob, fileName + ".cir")
}
