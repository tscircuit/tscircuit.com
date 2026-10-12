import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

export const downloadAssemblyStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await withDownloadToast(
    "Preparing assembly STEP download...",
    async () => {
      const { circuitJsonToStep } = await import("circuit-json-to-step")
      return circuitJsonToStep(circuitJson, { exportMode: "assembly" })
    },
  )
  const blob = new Blob([content], { type: "application/step" })
  saveAs(blob, `${fileName}-assembly.step`)
}
