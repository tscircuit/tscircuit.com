import { loadCircuitJsonToSpice } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"

export const downloadSpiceFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const { circuitJsonToSpice } = await loadCircuitJsonToSpice()
  const spiceNetlist = circuitJsonToSpice(circuitJson)
  const spiceString = spiceNetlist.toSpiceString()
  const blob = new Blob([spiceString], { type: "text/plain" })
  saveAs(blob, fileName + ".cir")
}
