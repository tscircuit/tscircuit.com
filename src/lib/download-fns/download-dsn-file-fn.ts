import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { convertCircuitJsonToDsnString } from "dsn-converter"

export const downloadDsnFile = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const dsnString = convertCircuitJsonToDsnString(circuitJson)
  const blob = new Blob([dsnString], { type: "text/plain" })
  saveAs(blob, fileName + ".dsn")
}
