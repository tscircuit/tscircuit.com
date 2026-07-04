import { loadCircuitJsonToReadableNetlist } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"

export const downloadReadableNetlist = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const { convertCircuitJsonToReadableNetlist } =
    await loadCircuitJsonToReadableNetlist()
  const readableNetlistString = convertCircuitJsonToReadableNetlist(circuitJson)
  const blob = new Blob([readableNetlistString], { type: "text/plain" })
  saveAs(blob, fileName + ".txt")
}
