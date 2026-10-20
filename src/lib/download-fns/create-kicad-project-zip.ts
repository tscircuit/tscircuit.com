import type { loadCircuitJsonToKicad } from "@/lib/utils/load-internal-dynamic-modules"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"

type KicadConverterModule = Awaited<ReturnType<typeof loadCircuitJsonToKicad>>

export const createKicadProjectZip = async ({
  circuitJson,
  fileName,
  converterModule,
}: {
  circuitJson: AnyCircuitElement[]
  fileName: string
  converterModule: KicadConverterModule
}) => {
  const {
    CircuitJsonToKicadPcbConverter,
    CircuitJsonToKicadSchConverter,
    CircuitJsonToKicadProConverter,
    resolveAndLoadKicad3dModelFiles,
  } = converterModule

  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson, {
    includeBuiltin3dModels: true,
    projectName: fileName,
  })
  pcbConverter.runUntilFinished()

  const schematicConverter = new CircuitJsonToKicadSchConverter(circuitJson)
  schematicConverter.runUntilFinished()
  const schematicFiles = schematicConverter.getOutputFiles({
    schematicFilename: `${fileName}.kicad_sch`,
  })

  const projectConverter = new CircuitJsonToKicadProConverter(circuitJson, {
    projectName: fileName,
    schematicFilename: `${fileName}.kicad_sch`,
    pcbFilename: `${fileName}.kicad_pcb`,
  })
  projectConverter.runUntilFinished()

  const zip = new JSZip()
  zip.file(`${fileName}.kicad_pcb`, pcbConverter.getOutputString())
  for (const schematicFile of schematicFiles) {
    zip.file(schematicFile.filename, schematicFile.content)
  }
  zip.file(`${fileName}.kicad_pro`, projectConverter.getOutputString())

  if (resolveAndLoadKicad3dModelFiles && pcbConverter.getModel3dSourcePaths) {
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
}
