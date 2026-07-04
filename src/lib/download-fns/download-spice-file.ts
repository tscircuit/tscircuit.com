import { loadCircuitJsonToSpice } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

export const downloadSpiceFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const spiceString = await withDownloadToast(
    "Preparing SPICE netlist download...",
    async () => {
      const { circuitJsonToSpice } = await loadCircuitJsonToSpice()
      const spiceNetlist = circuitJsonToSpice(circuitJson)
      return spiceNetlist.toSpiceString()
    },
  )
  const blob = new Blob([spiceString], { type: "text/plain" })
  saveAs(blob, fileName + ".cir")
}
