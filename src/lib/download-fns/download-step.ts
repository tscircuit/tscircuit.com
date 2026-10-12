import type { AnyCircuitElement } from "circuit-json"
import type { CircuitJsonToStepOptions } from "circuit-json-to-step"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

export const createStepDownload = async (
  circuitJson: AnyCircuitElement[],
  options: CircuitJsonToStepOptions = {},
) => {
  const { circuitJsonToStep } = await import("circuit-json-to-step")
  const output = await circuitJsonToStep(circuitJson, {
    includeComponents: true,
    ...options,
  })
  if (typeof output === "string") {
    return {
      blob: new Blob([output], { type: "application/step" }),
      extension: "step",
    }
  }
  const zip = new JSZip()
  for (const [fileName, content] of Object.entries(output)) {
    zip.file(fileName, content)
  }
  return { blob: await zip.generateAsync({ type: "blob" }), extension: "zip" }
}

export const downloadStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
  options: CircuitJsonToStepOptions = {},
) => {
  const { blob, extension } = await withDownloadToast(
    "Preparing STEP download...",
    () => createStepDownload(circuitJson, options),
  )
  saveAs(blob, `${fileName}.${extension}`)
}
