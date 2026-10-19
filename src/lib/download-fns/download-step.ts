import { loadCircuitJsonToStep } from "@/lib/utils/load-internal-dynamic-modules"
import {
  loadPackageModelAssets,
  type ModelAssetRequest,
} from "@/lib/package-model-assets"
import { su } from "@tscircuit/circuit-json-util"
import type { CadComponent, CircuitJson } from "circuit-json"
import type { CircuitJsonToStepOptions } from "circuit-json-to-step"
import { saveAs } from "file-saver"
import { withDownloadToast } from "./download-toast"

const MODEL_URL_FIELDS = [
  "model_step_url",
  "model_stl_url",
  "model_obj_url",
  "model_gltf_url",
  "model_glb_url",
] as const satisfies readonly (keyof CadComponent)[]

export const downloadStepFile = async (
  circuitJson: CircuitJson,
  fileName: string,
  options: Omit<ModelAssetRequest, "assetUrls">,
) => {
  const content = await withDownloadToast(
    "Preparing STEP download...",
    async () => {
      const { circuitJsonToStep } = await loadCircuitJsonToStep()
      const resolvedCircuit = circuitJson.map((element) =>
        element.type === "cad_component" ? { ...element } : element,
      )
      const models = su(resolvedCircuit)
        .cad_component.list()
        .filter((model) => !model.model_jscad)
        .flatMap((model) => {
          const field = MODEL_URL_FIELDS.find((field) => model[field])
          const url = field && model[field]
          return field && url ? [{ model, field, url }] : []
        })
      const load = loadPackageModelAssets({
        ...options,
        assetUrls: Array.from(
          new Set(
            models.map(({ url }) => url).filter((url) => !URL.canParse(url)),
          ),
        ),
      })
      try {
        const urls = await load.promise
        const fsMap: NonNullable<CircuitJsonToStepOptions["fsMap"]> = {
          ...options.fsMap,
        }
        await Promise.all(
          models.map(async ({ model, field, url }) => {
            if (field === "model_step_url" && fsMap[url] !== undefined) return
            if (URL.canParse(url)) {
              const modelUrl = new URL(url)
              // Model CDN responses vary by origin; keep its cache key in sync.
              if (modelUrl.searchParams.has("cachebust_origin")) {
                modelUrl.searchParams.set(
                  "cachebust_origin",
                  window.location.origin,
                )
                model[field] = modelUrl.href
              }
              return
            }
            const blobUrl = urls[url]
            if (!blobUrl) throw new Error(`Unable to load model asset: ${url}`)
            if (field === "model_step_url") {
              fsMap[url] = await (await fetch(blobUrl)).text()
            } else {
              model[field] = blobUrl
            }
          }),
        )
        return await circuitJsonToStep(resolvedCircuit, {
          productName: fileName,
          fsMap,
        })
      } finally {
        load.dispose()
      }
    },
  )
  const blob = new Blob([content], { type: "text/plain" })
  saveAs(blob, fileName + ".step")
}
