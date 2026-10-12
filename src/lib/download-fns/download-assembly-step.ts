import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

interface AssemblyStepCircuit {
  filePath?: string
  circuitJson: AnyCircuitElement[]
}

export const downloadAssemblyStepFile = async (
  circuits: AssemblyStepCircuit[],
  packageName: string,
) => {
  const blob = await withDownloadToast(
    "Preparing Assembly STEP download...",
    async () => {
      const { circuitJsonToStep } = await import("circuit-json-to-step")
      const noPrintedPartsMessage =
        "No assembly.printedpart elements found to export"
      const zip = new JSZip()
      for (const { filePath, circuitJson } of circuits) {
        try {
          const files = await circuitJsonToStep(circuitJson, {
            exportMode: "assembly",
          })
          for (const [fileName, stepText] of Object.entries(files)) {
            const partPath = filePath ? `${filePath}/${fileName}` : fileName
            zip.file(`${packageName}/${partPath}`, stepText)
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === noPrintedPartsMessage
          ) {
            continue
          }
          throw error
        }
      }
      if (!Object.keys(zip.files).length) {
        throw new Error(noPrintedPartsMessage)
      }
      return zip.generateAsync({ type: "blob" })
    },
  )
  saveAs(blob, `${packageName}-assembly.zip`)
}
