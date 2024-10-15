import { saveAs } from "file-saver"
import { createBlobURL } from "./createBlobURL"
import { AnyCircuitElement } from "circuit-json"

export const downloadCircuitJson = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const stringifiedCircuitJson = JSON.stringify(circuitJson, null, 2)
  const blob = new Blob([stringifiedCircuitJson], { type: "application/json" })
  saveAs(blob, fileName)
}
