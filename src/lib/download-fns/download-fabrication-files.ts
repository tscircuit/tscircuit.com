import {
  loadCircuitJsonToBomCsv,
  loadCircuitJsonToGerber,
  loadCircuitJsonToPnpCsv,
} from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

type GerberConverter = Awaited<ReturnType<typeof loadCircuitJsonToGerber>>
type BomConverter = Awaited<ReturnType<typeof loadCircuitJsonToBomCsv>>
type PnpConverter = Awaited<ReturnType<typeof loadCircuitJsonToPnpCsv>>

export const createFabricationFilesZip = async ({
  circuitJson,
  gerberConverter,
  bomConverter,
  pnpConverter,
}: {
  circuitJson: AnyCircuitElement[]
  gerberConverter: GerberConverter
  bomConverter: BomConverter
  pnpConverter: PnpConverter
}) => {
  const zip = new JSZip()
  const {
    convertSoupToGerberCommands,
    stringifyGerberCommandLayers,
    convertSoupToExcellonDrillCommandLayers,
    stringifyExcellonDrill,
  } = gerberConverter
  const { convertCircuitJsonToBomRows, convertBomRowsToCsv } = bomConverter
  const { convertCircuitJsonToPickAndPlaceCsv } = pnpConverter

  const gerberLayerCmds = convertSoupToGerberCommands(circuitJson, {
    flip_y_axis: false,
  })
  const gerberFileContents = stringifyGerberCommandLayers(gerberLayerCmds)

  for (const [fileName, fileContents] of Object.entries(gerberFileContents)) {
    zip.file(`gerber/${fileName}.gbr`, fileContents)
  }

  const drillCommandLayers = convertSoupToExcellonDrillCommandLayers({
    circuitJson,
    flip_y_axis: false,
  })
  for (const [fileName, drillCommands] of Object.entries(drillCommandLayers)) {
    zip.file(`gerber/${fileName}`, stringifyExcellonDrill(drillCommands))
  }

  const bomRows = await convertCircuitJsonToBomRows({ circuitJson })
  const bomCsv = await convertBomRowsToCsv(bomRows)
  zip.file("bom.csv", bomCsv)

  const pnpCsv = await convertCircuitJsonToPickAndPlaceCsv(circuitJson)
  zip.file("pick_and_place.csv", pnpCsv)

  return zip.generateAsync({ type: "blob" })
}

export const downloadFabricationFiles = async ({
  circuitJson,
  snippetUnscopedName,
}: {
  circuitJson: AnyCircuitElement[]
  snippetUnscopedName: string
}) => {
  const zipBlob = await withDownloadToast(
    "Preparing fabrication files...",
    async () => {
      const [gerberConverter, bomConverter, pnpConverter] = await Promise.all([
        loadCircuitJsonToGerber(),
        loadCircuitJsonToBomCsv(),
        loadCircuitJsonToPnpCsv(),
      ])

      return createFabricationFilesZip({
        circuitJson,
        gerberConverter,
        bomConverter,
        pnpConverter,
      })
    },
  )

  // Generate and download the zip file
  saveAs(zipBlob, `${snippetUnscopedName}_fabrication_files.zip`)
}
