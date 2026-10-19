import { loadCircuitJsonToStep } from "@/lib/utils/load-internal-dynamic-modules"
import {
  fetchPackageModelAsset,
  loadPackageModelAssets,
  normalizeAssetPath,
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
      const fsMap: NonNullable<CircuitJsonToStepOptions["fsMap"]> = {}
      const meshUrls = new Map<string, string>()
      const disposeAssets: Array<() => void> = []
      try {
        for (const model of su(resolvedCircuit).cad_component.list()) {
          if (model.model_jscad) continue
          const field = MODEL_URL_FIELDS.find((field) => model[field])
          const url = field && model[field]
          if (!field || !url) continue
          if (field === "model_step_url") {
            const content =
              fsMap[url] ??
              options.fsMap?.[url] ??
              options.fsMap?.[normalizeAssetPath(url)]
            if (content !== undefined) {
              fsMap[url] = content
              continue
            }
          }
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
            continue
          }
          if (field === "model_step_url") {
            const response = await fetchPackageModelAsset({
              ...options,
              assetUrl: url,
            })
            fsMap[url] = await response.text()
          } else {
            let blobUrl = meshUrls.get(url)
            if (!blobUrl) {
              const load = loadPackageModelAssets({
                ...options,
                assetUrls: [url],
              })
              disposeAssets.push(load.dispose)
              blobUrl = (await load.promise)[url]
              if (!blobUrl)
                throw new Error(`Unable to load model asset: ${url}`)
              meshUrls.set(url, blobUrl)
            }
            model[field] = blobUrl
          }
        }
        return await circuitJsonToStep(resolvedCircuit, {
          productName: fileName,
          fsMap,
        })
      } finally {
        for (const dispose of disposeAssets) dispose()
      }
    },
  )
  const blob = new Blob([content], { type: "text/plain" })
  saveAs(blob, fileName + ".step")
}
