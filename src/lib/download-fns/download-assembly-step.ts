import type { AnyCircuitElement } from "circuit-json"
import { downloadStepFile } from "./download-step"

export const downloadAssemblyStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) =>
  downloadStepFile(circuitJson, `${fileName}-assembly-step`, {
    exportMode: "assembly",
  })
