import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

export const createAltiumProjectZip = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const { convertCircuitJsonToAltiumZip } = await import(
    "circuit-json-to-altium"
  )
  const bytes = await convertCircuitJsonToAltiumZip(circuitJson, fileName)
  return new Blob([new Uint8Array(bytes)], { type: "application/zip" })
}

export const downloadAltiumFiles = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await withDownloadToast(
    "Preparing Altium project download...",
    () => createAltiumProjectZip(circuitJson, fileName),
  )
  saveAs(content, `${fileName}_altium.zip`)
}
