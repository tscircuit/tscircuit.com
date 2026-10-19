import { loadCircuitJsonToStep } from "@/lib/utils/load-internal-dynamic-modules"
import type { CircuitJson } from "circuit-json"
import type { CircuitJsonToStepOptions } from "circuit-json-to-step"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

export const downloadStepFile = async (
  circuitJson: CircuitJson,
  fileName: string,
  options?: Pick<CircuitJsonToStepOptions, "fsMap">,
) => {
  const content = await withDownloadToast(
    "Preparing STEP download...",
    async () => {
      const { circuitJsonToStep } = await loadCircuitJsonToStep()
      return circuitJsonToStep(circuitJson, {
        productName: fileName,
        ...(options?.fsMap && Object.keys(options.fsMap).length
          ? { fsMap: options.fsMap }
          : {}),
      })
    },
  )
  if (
    typeof content !== "string" ||
    !/=\s*NEXT_ASSEMBLY_USAGE_OCCURRENCE\s*\(/i.test(content)
  ) {
    throw new Error(
      "Unable to create a complete STEP assembly. Please try again later.",
    )
  }
  const blob = new Blob([content], { type: "text/plain" })
  saveAs(blob, fileName + ".step")
}
