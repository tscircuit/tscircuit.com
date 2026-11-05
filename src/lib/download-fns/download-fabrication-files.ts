import {
  loadCircuitJsonToBomCsv,
  loadCircuitJsonToGerber,
  loadCircuitJsonToPnpCsv,
} from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import type { PickAndPlaceRotationWarning } from "circuit-json-to-pnp-csv"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import toast from "react-hot-toast"
import { withDownloadToast } from "./download-toast"

type GerberConverter = Awaited<ReturnType<typeof loadCircuitJsonToGerber>>
type BomConverter = Awaited<ReturnType<typeof loadCircuitJsonToBomCsv>>
type PnpConverter = Awaited<ReturnType<typeof loadCircuitJsonToPnpCsv>>

export const createFabricationFilesZip = async ({
  circuitJson,
  gerberConverter,
  bomConverter,
  pnpConverter,
  onPlacementWarnings,
}: {
  circuitJson: AnyCircuitElement[]
  gerberConverter: GerberConverter
  bomConverter: BomConverter
  pnpConverter: PnpConverter
  onPlacementWarnings?: (warnings: PickAndPlaceRotationWarning[]) => void
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

  const placementWarnings: PickAndPlaceRotationWarning[] = []
  const pnpCsv = await convertCircuitJsonToPickAndPlaceCsv(circuitJson, {
    supplier: "jlcpcb",
    // Collect all unresolved frames, but never include their fallback angles
    // in a fabrication placement file.
    requireSupplierRotation: false,
    onRotationWarning: (warning) => placementWarnings.push(warning),
  })
  if (placementWarnings.length) {
    zip.file(
      "placement_warnings.txt",
      [
        "Pick-and-place file omitted: JLCPCB component rotations could not be verified.",
        "This archive contains Gerbers and BOM only. It is not a complete assembly package.",
        "Provide verified pin1_location and supplier_pin1_location_map.jlcpcb metadata for the listed components, then export again to obtain pick_and_place.csv.",
        "",
        ...placementWarnings.map((warning) => warning.message),
        "",
      ].join("\n"),
    )
  } else {
    zip.file("pick_and_place.csv", pnpCsv)
  }

  const blob = await zip.generateAsync({ type: "blob" })
  if (placementWarnings.length) onPlacementWarnings?.(placementWarnings)
  return blob
}

export const downloadFabricationFiles = async ({
  circuitJson,
  snippetUnscopedName,
}: {
  circuitJson: AnyCircuitElement[]
  snippetUnscopedName: string
}) => {
  let hasPlacementWarnings = false
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
        onPlacementWarnings: () => {
          hasPlacementWarnings = true
        },
      })
    },
  )

  // Generate and download the zip file
  saveAs(zipBlob, `${snippetUnscopedName}_fabrication_files.zip`)
  if (hasPlacementWarnings) {
    toast(
      "Downloaded Gerbers and BOM without pick-and-place data. See placement_warnings.txt in the ZIP for unverified component rotations.",
      { icon: "⚠️", duration: 10000 },
    )
  }
}
