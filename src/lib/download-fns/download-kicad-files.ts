import { saveAs } from "file-saver"
import { convertCircuitJsonToKiCadPcb } from "kicad-converter"
import { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"

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

  const zip = new JSZip()

  // Add the PCB file content to the zip file
  zip.file(`${fileName}.kicad_pcb`, pcbContent)

  // Generate the zip file and trigger download
  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${fileName}.zip`)
  })
}
