import { saveAs } from "file-saver"
import {
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadSchConverter,
  CircuitJsonToKicadProConverter,
  resolveAndLoadKicad3dModelFiles,
} from "circuit-json-to-kicad"
import { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"

export const downloadKicadFiles = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson, {
    includeBuiltin3dModels: true,
    projectName: fileName,
  })
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

  await resolveAndLoadKicad3dModelFiles({
    projectName: fileName,
    model3dSourcePaths: pcbConverter.getModel3dSourcePaths(),
    fetch,
    onModelFile: ({ outputPath, content }) => {
      zip.file(outputPath, content)
    },
    onError: ({ sourcePath }) => {
      console.warn(`Failed to load 3D model from ${sourcePath}`)
    },
  })

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${fileName}_kicad.zip`)
  })
}
