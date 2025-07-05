import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { convertCircuitJsonToKiCadPcb } from "kicad-converter"
import { convertCircuitJsonToKicadPro } from "kicad-converter"

export const downloadKicadFiles = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const kicadPcbString = convertCircuitJsonToKiCadPcb(circuitJson as any)
  const pcbContent =
    typeof kicadPcbString === "object"
      ? JSON.stringify(kicadPcbString)
      : kicadPcbString

  const kicadProContent = convertCircuitJsonToKicadPro(circuitJson as any)
  const proContent = JSON.stringify(kicadProContent)

  const zip = new JSZip()
  zip.file(`${fileName}.kicad_pcb`, pcbContent)
  zip.file(`${fileName}.kicad_pro`, proContent)

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${fileName}_kicad.zip`)
  })
}
