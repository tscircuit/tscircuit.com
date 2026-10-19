import type { CadComponent, CircuitJson } from "circuit-json"
import type { CircuitJsonToStepOptions } from "circuit-json-to-step"
import {
  getPackageFileLookupParams,
  loadPackageModelAssets,
  normalizeAssetPath,
  type ModelAssetRequest,
} from "./package-model-assets"

const MODEL_URL_FIELDS = [
  "model_stl_url",
  "model_obj_url",
  "model_gltf_url",
  "model_glb_url",
  "model_step_url",
] as const satisfies readonly (keyof CadComponent)[]

type ModelUrlField = (typeof MODEL_URL_FIELDS)[number]
type StepFileMap = NonNullable<CircuitJsonToStepOptions["fsMap"]>
type ExportModelAssetRequest = Omit<ModelAssetRequest, "assetUrls"> &
  Pick<CircuitJsonToStepOptions, "fsMap"> & {
    preserveStepUrls?: boolean
  }

/** Keep resolved package and editor models available until conversion finishes. */
export async function withResolvedModelAssets<T>(
  circuitJson: CircuitJson,
  request: ExportModelAssetRequest,
  exportFn: (
    resolvedCircuitJson: CircuitJson,
    stepFsMap: StepFileMap,
  ) => Promise<T>,
): Promise<T> {
  const assetUrls = new Set<string>()
  const activeAssets = new Map<
    CadComponent,
    { field: ModelUrlField; assetUrl: string }
  >()
  for (const element of circuitJson) {
    if (element.type !== "cad_component") continue
    // STEP converts inline JSCAD first; GLTF loaders prefer their supported URLs.
    if (request.preserveStepUrls && element.model_jscad) continue
    const fields: readonly ModelUrlField[] =
      request.preserveStepUrls && element.model_step_url
        ? ["model_step_url"]
        : MODEL_URL_FIELDS
    const field = fields.find((key) => element[key])
    const value = field ? element[field] : undefined
    if (field && value && !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) {
      activeAssets.set(element, { field, assetUrl: value })
      assetUrls.add(value)
    }
  }

  const localContents = new Map<string, string>()
  const packageUrls: string[] = []
  for (const assetUrl of assetUrls) {
    const content =
      request.fsMap?.[assetUrl] ?? request.fsMap?.[normalizeAssetPath(assetUrl)]
    if (content !== undefined) {
      localContents.set(assetUrl, content)
    } else if (getPackageFileLookupParams({ ...request, assetUrl })) {
      packageUrls.push(assetUrl)
    } else {
      throw new Error(`Unable to resolve model asset: ${assetUrl}`)
    }
  }

  const load = loadPackageModelAssets({ ...request, assetUrls: packageUrls })
  const localBlobUrls: string[] = []
  try {
    const urls = await load.promise
    for (const [assetUrl, content] of localContents) {
      const blobUrl = URL.createObjectURL(new Blob([content]))
      localBlobUrls.push(blobUrl)
      urls[assetUrl] = blobUrl
    }
    const stepFsMap: StepFileMap = {}
    const resolvedCircuitJson = await Promise.all(
      circuitJson.map(async (element) => {
        if (element.type !== "cad_component") return element
        const asset = activeAssets.get(element)
        if (!asset) {
          if (
            request.preserveStepUrls &&
            !element.model_jscad &&
            element.model_step_url &&
            URL.canParse(element.model_step_url)
          ) {
            const modelUrl = new URL(element.model_step_url)
            // Model CDN responses vary by origin; keep its cache key in sync.
            if (modelUrl.searchParams.has("cachebust_origin")) {
              modelUrl.searchParams.set(
                "cachebust_origin",
                window.location.origin,
              )
              return { ...element, model_step_url: modelUrl.href }
            }
          }
          return element
        }
        const { field, assetUrl } = asset
        const blobUrl = urls[assetUrl]
        if (!blobUrl) {
          throw new Error(`Unable to load model asset: ${assetUrl}`)
        }
        if (field === "model_step_url" && request.preserveStepUrls) {
          stepFsMap[assetUrl] =
            localContents.get(assetUrl) ?? (await (await fetch(blobUrl)).text())
          return element
        }
        return { ...element, [field]: blobUrl }
      }),
    )
    return await exportFn(resolvedCircuitJson, stepFsMap)
  } finally {
    load.dispose()
    for (const blobUrl of localBlobUrls) URL.revokeObjectURL(blobUrl)
  }
}
