import { loadCircuitJsonToReadableNetlist } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

export const downloadReadableNetlist = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const readableNetlistString = await withDownloadToast(
    "Preparing readable netlist download...",
    async () => {
      const { convertCircuitJsonToReadableNetlist } =
        await loadCircuitJsonToReadableNetlist()
      return convertCircuitJsonToReadableNetlist(circuitJson)
    },
  )
  const blob = new Blob([readableNetlistString], { type: "text/plain" })
  saveAs(blob, fileName + ".txt")
}
