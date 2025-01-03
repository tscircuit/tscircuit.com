import { saveAs } from "file-saver"
import { convertCircuitJsonToKiCadPcb } from "kicad-converter"
import { AnyCircuitElement } from "circuit-json"

export const downloadKiCadPcbFile = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  // Ensure the output is a string or BlobPart
  const kicadPcbString = convertCircuitJsonToKiCadPcb(circuitJson)

  // If the result is an object, convert it to a string
  const pcbContent =
    typeof kicadPcbString === "object"
      ? JSON.stringify(kicadPcbString)
      : kicadPcbString

  const blob = new Blob([pcbContent], { type: "text/plain" })
  saveAs(blob, `${fileName}.kicad_pcb`)
}
