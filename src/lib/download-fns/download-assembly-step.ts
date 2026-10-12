import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

export interface AssemblyStepCircuit {
  filePath?: string
  circuitJson: AnyCircuitElement[]
}

type AssemblyStepCircuits =
  | Iterable<AssemblyStepCircuit>
  | AsyncIterable<AssemblyStepCircuit>
type AssemblyStepConverter = (
  circuitJson: AnyCircuitElement[],
  options: { exportMode: "assembly" },
) => Promise<Record<string, string>>

export const createAssemblyStepZip = async (
  circuits: AssemblyStepCircuits,
  converter?: AssemblyStepConverter,
) => {
  const zip = new JSZip()
  let partCount = 0
  for await (const { filePath, circuitJson } of circuits) {
    if (
      !circuitJson.some(
        (element) =>
          element.type === "source_component" &&
          element.ftype === "printedpart",
      )
    ) {
      continue
    }
    converter ??= (await import("circuit-json-to-step")).circuitJsonToStep
    // Circuit IDs are local to each board, so convert each board separately.
    const files = await converter(circuitJson, { exportMode: "assembly" })
    for (const [fileName, stepText] of Object.entries(files)) {
      zip.file(filePath ? `${filePath}/${fileName}` : fileName, stepText)
      partCount++
    }
  }
  if (!partCount) {
    throw new Error("No assembly.printedpart elements found to export")
  }
  return zip.generateAsync({ type: "blob" })
}

export const downloadAssemblyStepFile = async (
  circuits: AssemblyStepCircuits,
  fileName: string,
) => {
  const blob = await withDownloadToast(
    "Preparing Assembly STEP download...",
    () => createAssemblyStepZip(circuits),
  )
  saveAs(blob, `${fileName}-assembly.zip`)
}
