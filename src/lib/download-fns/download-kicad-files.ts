import { loadCircuitJsonToKicad } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

export const downloadKicadFiles = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await withDownloadToast(
    "Preparing KiCad project download...",
    async () => {
      const {
        CircuitJsonToKicadPcbConverter,
        CircuitJsonToKicadSchConverter,
        CircuitJsonToKicadProConverter,
        resolveAndLoadKicad3dModelFiles,
      } = await loadCircuitJsonToKicad()

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

      if (
        resolveAndLoadKicad3dModelFiles &&
        pcbConverter.getModel3dSourcePaths
      ) {
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
      }

      return zip.generateAsync({ type: "blob" })
    },
  )

  saveAs(content, `${fileName}_kicad.zip`)
}
