import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

export const createPrintedPartStepsZip = async (
  circuitJson: AnyCircuitElement[],
) => {
  const { circuitJsonToPrintedPartStepFiles } = await import(
    "circuit-json-to-step"
  )
  const files = circuitJsonToPrintedPartStepFiles(circuitJson)
  const zip = new JSZip()
  for (const [fileName, content] of Object.entries(files)) {
    zip.file(fileName, content)
  }
  return zip.generateAsync({ type: "blob" })
}

export const downloadPrintedPartSteps = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const zip = await withDownloadToast(
    "Preparing separate printed-part STEP files...",
    () => createPrintedPartStepsZip(circuitJson),
  )
  saveAs(zip, `${fileName}-printed-parts-step.zip`)
}
