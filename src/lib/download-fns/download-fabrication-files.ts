import {
  loadCircuitJsonToBomCsv,
  loadCircuitJsonToGerber,
  loadCircuitJsonToPnpCsv,
} from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"
import {
  createFabricationPartFetcher,
  prepareJlcpcbPickAndPlace,
  type FabricationPlatformOptions,
  type FetchSupplierPartCircuitJson,
} from "./prepare-jlcpcb-pick-and-place"

type GerberConverter = Awaited<ReturnType<typeof loadCircuitJsonToGerber>>
type BomConverter = Awaited<ReturnType<typeof loadCircuitJsonToBomCsv>>
type PnpConverter = Awaited<ReturnType<typeof loadCircuitJsonToPnpCsv>>

export const createFabricationFilesZip = async ({
  circuitJson,
  gerberConverter,
  bomConverter,
  pnpConverter,
  fetchSupplierPartCircuitJson = createFabricationPartFetcher(),
}: {
  circuitJson: AnyCircuitElement[]
  gerberConverter: GerberConverter
  bomConverter: BomConverter
  pnpConverter: PnpConverter
  fetchSupplierPartCircuitJson?: FetchSupplierPartCircuitJson
}) => {
  const zip = new JSZip()
  const { convertCircuitJsonToBomRows, convertBomRowsToCsv } = bomConverter
  const { convertCircuitJsonToPickAndPlaceCsv } = pnpConverter

  const gerberFiles = gerberConverter.convertCircuitJsonToGerberFiles(
    circuitJson,
    {
      flip_y_axis: false,
    },
  )
  for (const [fileName, fileContents] of Object.entries(gerberFiles)) {
    zip.file(`gerber/${fileName}`, fileContents)
  }

  const bomRows = await convertCircuitJsonToBomRows({ circuitJson })
  const bomCsv = await convertBomRowsToCsv(bomRows)
  zip.file("bom.csv", bomCsv)

  const placement = await prepareJlcpcbPickAndPlace(
    circuitJson,
    fetchSupplierPartCircuitJson,
  )
  const pnpCsv = await convertCircuitJsonToPickAndPlaceCsv(
    placement.circuitJson,
    { supplier: "jlcpcb" },
  )
  zip.file("pick_and_place.csv", pnpCsv)
  if (placement.warnings.length) {
    zip.file("placement_warnings.txt", placement.warnings.sort().join("\n"))
  }

  return zip.generateAsync({ type: "blob" })
}

export const downloadFabricationFiles = async ({
  circuitJson,
  snippetUnscopedName,
  easyEdaProxyConfig,
}: {
  circuitJson: AnyCircuitElement[]
  snippetUnscopedName: string
  easyEdaProxyConfig?: FabricationPlatformOptions["easyEdaProxyConfig"]
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
        fetchSupplierPartCircuitJson: createFabricationPartFetcher({
          easyEdaProxyConfig,
        }),
      })
    },
  )

  // Generate and download the zip file
  saveAs(zipBlob, `${snippetUnscopedName}_fabrication_files.zip`)
}
