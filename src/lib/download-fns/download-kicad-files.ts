import { saveAs } from "file-saver"
import {
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadSchConverter,
  CircuitJsonToKicadProConverter,
} from "circuit-json-to-kicad"
import { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"

const isBuiltinModelPath = (modelPath: string) =>
  modelPath.startsWith("http://modelcdn.tscircuit.com") ||
  modelPath.startsWith("https://modelcdn.tscircuit.com")

export const downloadKicadFiles = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson, {
    includeBuiltin3dModels: true,
    projectName: fileName,
  } as any)
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

  for (const modelPath of (pcbConverter as any).getModel3dSourcePaths()) {
    const response = await fetch(modelPath)
    if (!response.ok) {
      throw new Error(`Failed to fetch 3D model from ${modelPath}`)
    }

    let shapesDir = `${fileName}.3dshapes`
    if (isBuiltinModelPath(modelPath)) {
      shapesDir = "tscircuit_builtin.3dshapes"
    }

    const modelFileName = modelPath.split("/").pop() || modelPath

    zip.file(
      `3dmodels/${shapesDir}/${modelFileName}`,
      await response.arrayBuffer(),
    )
  }

  const content = await zip.generateAsync({ type: "blob" })
  saveAs(content, `${fileName}_kicad.zip`)
}
