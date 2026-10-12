import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

export const downloadAssemblyStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const blob = await withDownloadToast(
    "Preparing Assembly STEP download...",
    async () => {
      const { circuitJsonToStep } = await import("circuit-json-to-step")
      const files = await circuitJsonToStep(circuitJson, {
        exportMode: "assembly",
      })
      const zip = new JSZip()
      for (const [fileName, stepText] of Object.entries(files)) {
        zip.file(fileName, stepText)
      }
      return zip.generateAsync({ type: "blob" })
    },
  )
  saveAs(blob, `${fileName}-assembly.zip`)
}
