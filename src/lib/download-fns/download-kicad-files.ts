import { saveAs } from "file-saver"
import {
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadSchConverter,
  CircuitJsonToKicadProConverter,
} from "circuit-json-to-kicad"
import { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"

export const downloadKicadFiles = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson)
  pcbConverter.runUntilFinished()
  const kicadPcbContent = pcbConverter.getOutputString()

  const schConverter = new CircuitJsonToKicadSchConverter(circuitJson)
  schConverter.runUntilFinished()
  const kicadSchContent = schConverter.getOutputString()

  const proConverter = new CircuitJsonToKicadProConverter(circuitJson, {
    projectName: fileName,
    schematicFilename: `${fileName}.kicad_sch`,
    pcbFilename: `${fileName}.kicad_pcb`,
  })
  proConverter.runUntilFinished()
  const kicadProContent = proConverter.getOutputString()

  const zip = new JSZip()
  zip.file(`${fileName}.kicad_pcb`, kicadPcbContent)
  zip.file(`${fileName}.kicad_sch`, kicadSchContent)
  zip.file(`${fileName}.kicad_pro`, kicadProContent)

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${fileName}_kicad.zip`)
  })
}
