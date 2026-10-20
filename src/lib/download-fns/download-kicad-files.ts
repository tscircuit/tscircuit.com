import { loadCircuitJsonToKicad } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

type KicadConverter = Awaited<ReturnType<typeof loadCircuitJsonToKicad>>

// Derive the injectable constructors from the published types, exposing only
// the instance methods used to build the ZIP.
type KicadZipConverters = {
  [Key in
    | "CircuitJsonToKicadPcbConverter"
    | "CircuitJsonToKicadSchConverter"
    | "CircuitJsonToKicadProConverter"]: new (
    ...args: ConstructorParameters<KicadConverter[Key]>
  ) => Pick<
    InstanceType<KicadConverter[Key]>,
    Extract<
      keyof InstanceType<KicadConverter[Key]>,
      | "runUntilFinished"
      | "getOutputString"
      | "getOutputFiles"
      | "getModel3dSourcePaths"
    >
  >
} & Partial<Pick<KicadConverter, "resolveAndLoadKicad3dModelFiles">>

export const createKicadProjectZip = async ({
  circuitJson,
  fileName,
  kicadConverter,
}: {
  circuitJson: AnyCircuitElement[]
  fileName: string
  kicadConverter: KicadZipConverters
}) => {
  const {
    CircuitJsonToKicadPcbConverter,
    CircuitJsonToKicadSchConverter,
    CircuitJsonToKicadProConverter,
    resolveAndLoadKicad3dModelFiles,
  } = kicadConverter

  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJson, {
    includeBuiltin3dModels: true,
    projectName: fileName,
  })
  pcbConverter.runUntilFinished()
  const kicadPcbContent = pcbConverter.getOutputString()

  const schConverter = new CircuitJsonToKicadSchConverter(circuitJson)
  schConverter.runUntilFinished()
  const schematicFiles = schConverter.getOutputFiles({
    schematicFilename: `${fileName}.kicad_sch`,
  })

  const proConverter = new CircuitJsonToKicadProConverter(circuitJson, {
    projectName: fileName,
    schematicFilename: `${fileName}.kicad_sch`,
    pcbFilename: `${fileName}.kicad_pcb`,
  })
  proConverter.runUntilFinished()
  const kicadProContent = proConverter.getOutputString()

  const zip = new JSZip()
  zip.file(`${fileName}.kicad_pcb`, kicadPcbContent)
  for (const { filename, content } of schematicFiles) {
    zip.file(filename, content)
  }
  zip.file(`${fileName}.kicad_pro`, kicadProContent)

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

export const downloadKicadFiles = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await withDownloadToast(
    "Preparing KiCad project download...",
    async () => {
      const kicadConverter = await loadCircuitJsonToKicad()
      return createKicadProjectZip({ circuitJson, fileName, kicadConverter })
    },
  )

  saveAs(content, `${fileName}_kicad.zip`)
}
