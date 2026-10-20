import { loadCircuitJsonToKicad } from "@/lib/utils/load-internal-dynamic-modules"
import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"
import { createKicadProjectZip } from "./create-kicad-project-zip"
import { withDownloadToast } from "./download-toast"

export const downloadKicadFiles = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const content = await withDownloadToast(
    "Preparing KiCad project download...",
    async () => {
      const converterModule = await loadCircuitJsonToKicad()
      return createKicadProjectZip({ circuitJson, fileName, converterModule })
    },
  )

  saveAs(content, `${fileName}_kicad.zip`)
}
