import { loadCircuitJsonToStep } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement, CircuitJson } from "circuit-json"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

export const downloadStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await withDownloadToast(
    "Preparing STEP download...",
    async () => {
      const { circuitJsonToStep } = await loadCircuitJsonToStep()
      return circuitJsonToStep(circuitJson, {
        includeComponents: true,
      })
    },
  )
  const blob = new Blob([content], { type: "text/plain" })
  saveAs(blob, fileName + ".step")
}
