import { useMemo } from "react"
import type { AnyCircuitElement } from "circuit-json"
import { usePackagePreviewIdentity } from "@/components/PackagePreviewScope"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackageModelAssets } from "@/hooks/use-package-model-assets"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { getPackageFileLookupParams } from "@/lib/package-model-assets"

export function usePackageCircuitModelAssets(
  circuitJson: AnyCircuitElement[] | null,
) {
  const { author, packageName, version, releaseId } =
    usePackagePreviewIdentity()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const request = useMemo(() => {
    const urls = new Set<string>()
    for (const element of circuitJson ?? []) {
      if (element.type !== "cad_component") continue
      for (const [field, modelUrl] of Object.entries(element)) {
        if (
          field.startsWith("model_") &&
          field.endsWith("_url") &&
          typeof modelUrl === "string" &&
          getPackageFileLookupParams({
            assetUrl: modelUrl,
            releaseId,
            author,
            packageName,
            version,
          })
        )
          urls.add(modelUrl)
      }
    }
    return {
      assetUrls: Array.from(urls),
      apiBaseUrl,
      token,
      releaseId,
      author,
      packageName,
      version,
    }
  }, [circuitJson, apiBaseUrl, token, releaseId, author, packageName, version])
  return usePackageModelAssets(request)
}
