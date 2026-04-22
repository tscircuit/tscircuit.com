import { AnyCircuitElement, CircuitJson } from "circuit-json"
import { saveAs } from "file-saver"
import { loadCircuitJsonToStep } from "@/lib/utils/load-internal-dynamic-modules"

export const downloadStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const { circuitJsonToStep } = await loadCircuitJsonToStep()
  const content = await circuitJsonToStep(circuitJson, {
    includeComponents: true,
  })
  const blob = new Blob([content], { type: "text/plain" })
  saveAs(blob, fileName + ".step")
}
