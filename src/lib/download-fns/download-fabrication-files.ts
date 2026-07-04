import {
  loadCircuitJsonToBomCsv,
  loadCircuitJsonToGerber,
  loadCircuitJsonToPnpCsv,
} from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"

export const downloadFabricationFiles = async ({
  circuitJson,
  snippetUnscopedName,
}: {
  circuitJson: AnyCircuitElement[]
  snippetUnscopedName: string
}) => {
  const zip = new JSZip()

  const {
    convertSoupToGerberCommands,
    stringifyGerberCommandLayers,
    convertSoupToExcellonDrillCommands,
    stringifyExcellonDrill,
  } = await loadCircuitJsonToGerber()
  const { convertCircuitJsonToBomRows, convertBomRowsToCsv } =
    await loadCircuitJsonToBomCsv()
  const { convertCircuitJsonToPickAndPlaceCsv } =
    await loadCircuitJsonToPnpCsv()

  // Generate Gerber files
  const gerberLayerCmds = convertSoupToGerberCommands(circuitJson, {
    flip_y_axis: false,
  })
  const gerberFileContents = stringifyGerberCommandLayers(gerberLayerCmds)

  for (const [fileName, fileContents] of Object.entries(gerberFileContents)) {
    zip.file(`gerber/${fileName}.gbr`, fileContents)
  }

  // Generate Drill files
  const drillCmds = convertSoupToExcellonDrillCommands({
    circuitJson,
    is_plated: true,
    flip_y_axis: false,
  })
  const drillFileContents = stringifyExcellonDrill(drillCmds)
  zip.file("gerber/drill.drl", drillFileContents)

  // Generate BOM CSV
  const bomRows = await convertCircuitJsonToBomRows({ circuitJson })
  const bomCsv = await convertBomRowsToCsv(bomRows)
  zip.file("bom.csv", bomCsv)

  // Generate Pick and Place CSV
  const pnpCsv = await convertCircuitJsonToPickAndPlaceCsv(circuitJson)
  zip.file("pick_and_place.csv", pnpCsv)

  // Generate and download the zip file
  const zipBlob = await zip.generateAsync({ type: "blob" })
  saveAs(zipBlob, `${snippetUnscopedName}_fabrication_files.zip`)
}
