import { saveAs } from "file-saver"
import { convertCircuitJsonToKiCadPcb } from "kicad-converter"
import { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"

export const downloadKiCadPcbFile = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const kicadPcbString = convertCircuitJsonToKiCadPcb(circuitJson)
  const pcbContent =
    typeof kicadPcbString === "object"
      ? JSON.stringify(kicadPcbString)
      : kicadPcbString
  const zip = new JSZip()
  zip.file(`${fileName}.kicad_pcb`, pcbContent)
  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${fileName}_kicad.zip`)
  })
}
