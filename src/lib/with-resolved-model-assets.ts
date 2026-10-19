import type { AnyCircuitElement } from "circuit-json"
import {
  getPackageFileLookupParams,
  loadPackageModelAssets,
  normalizeAssetPath,
  type ModelAssetRequest,
} from "./package-model-assets"

type ExportModelAssetRequest = Omit<ModelAssetRequest, "assetUrls"> & {
  fsMap?: Record<string, string>
  preserveStepUrls?: boolean
}

/** Keep resolved package and editor models available until conversion finishes. */
export async function withResolvedModelAssets<T>(
  circuitJson: AnyCircuitElement[],
  request: ExportModelAssetRequest,
  exportFn: (
    resolvedCircuitJson: AnyCircuitElement[],
    stepFsMap: Record<string, string>,
  ) => Promise<T>,
): Promise<T> {
  const assetUrls = new Set<string>()
  const activeUrlFields = new Map<AnyCircuitElement, string>()
  for (const element of circuitJson) {
    if (element.type !== "cad_component") continue
    // STEP converts inline JSCAD first; GLTF loaders prefer their supported URLs.
    if (request.preserveStepUrls && element.model_jscad) continue
    const fields =
      request.preserveStepUrls && element.model_step_url
        ? ["model_step_url"]
        : [
            "model_stl_url",
            "model_obj_url",
            "model_gltf_url",
            "model_glb_url",
            "model_step_url",
          ]
    const properties = element as unknown as Record<string, unknown>
    const field = fields.find(
      (key) => typeof properties[key] === "string" && properties[key],
    )
    const value = field ? properties[field] : undefined
    if (
      field &&
      typeof value === "string" &&
      !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)
    ) {
      activeUrlFields.set(element, field)
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
    for (const assetUrl of assetUrls) {
      if (!urls[assetUrl]) {
        throw new Error(`Unable to load model asset: ${assetUrl}`)
      }
    }

    const stepFsMap: Record<string, string> = {}
    const resolvedCircuitJson = await Promise.all(
      circuitJson.map(async (element) => {
        const field = activeUrlFields.get(element)
        if (!field) {
          if (
            request.preserveStepUrls &&
            element.type === "cad_component" &&
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
        const value = (element as unknown as Record<string, string>)[field]!
        const blobUrl = urls[value]!
        if (field === "model_step_url" && request.preserveStepUrls) {
          stepFsMap[value] =
            localContents.get(value) ?? (await (await fetch(blobUrl)).text())
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
