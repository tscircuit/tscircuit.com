import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { circuitJsonToStep } from "circuit-json-to-step"

export const downloadStepFile = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await circuitJsonToStep(circuitJson)
  const blob = new Blob([content], { type: "text/plain" })
  saveAs(blob, fileName + ".step")
}
