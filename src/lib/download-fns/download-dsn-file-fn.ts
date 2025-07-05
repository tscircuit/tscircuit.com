import { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToDsnString } from "dsn-converter"
import { saveAs } from "file-saver"

export const downloadDsnFile = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const dsnString = convertCircuitJsonToDsnString(circuitJson)
  const blob = new Blob([dsnString], { type: "text/plain" })
  saveAs(blob, fileName + ".dsn")
}
