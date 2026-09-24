import { usePackageModelAssets } from "@/hooks/use-package-model-assets"
import { getPackageFileLookupParams } from "@/lib/package-model-assets"
import { CadViewer } from "@tscircuit/3d-viewer"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useUrlParams } from "@/hooks/use-url-params"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Suspense, useMemo } from "react"
import { useParams } from "wouter"
import type { AnyCircuitElement } from "circuit-json"

function useModelBlobUrls(circuitJson: AnyCircuitElement[] | null) {
  const { author, packageName } = useParams()
  const { version, package_release_id: releaseId } = useUrlParams()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const request = useMemo(() => {
    const urls = new Set<string>()
    for (const element of circuitJson ?? []) {
      if (element.type !== "cad_component") continue
      for (const [key, value] of Object.entries(element)) {
        if (
          key.startsWith("model_") &&
          key.endsWith("_url") &&
          typeof value === "string" &&
          getPackageFileLookupParams({
            assetUrl: value,
            releaseId,
            author,
            packageName,
            version,
          })
        )
          urls.add(value)
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

export default function ThreeDView() {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  const { resolveStaticAsset, isLoading: isLoadingModels } =
    useModelBlobUrls(circuitJson)

  if (isLoading || isLoadingModels) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center h-[620px]">
        <p className="text-gray-500 dark:text-[#8b949e]">Loading 3D view...</p>
      </div>
    )
  }

  if (error || !circuitJson) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">
          {error || "Circuit JSON not available"}
        </p>
      </div>
    )
  }

  return (
    <div className="h-[620px]">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <div className="w-48">
              <div className="loading">
                <div className="loading-bar"></div>
              </div>
            </div>
          </div>
        }
      >
        <CadViewer
          clickToInteractEnabled
          circuitJson={circuitJson}
          resolveStaticAsset={resolveStaticAsset}
        />
      </Suspense>
    </div>
  )
}
