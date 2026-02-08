import { CadViewer } from "@tscircuit/3d-viewer"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useUrlParams } from "@/hooks/use-url-params"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Suspense, useCallback } from "react"
import { useParams } from "wouter"

export default function ThreeDView() {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  const { author, packageName } = useParams()
  const urlParams = useUrlParams()
  const apiBaseUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)

  const version = urlParams.version
  const releaseId = urlParams.package_release_id

  const resolveStaticAsset = useCallback(
    (assetPath: string) => {
      const params = new URLSearchParams()
      if (releaseId) {
        params.set("package_release_id", releaseId)
        params.set("file_path", assetPath)
      } else if (author && packageName) {
        const nameWithVersion = `${author}/${packageName}@${version || "latest"}`
        params.set("package_name_with_version", nameWithVersion)
        params.set("file_path", assetPath)
      }
      if (session?.token) {
        params.set("session_token", session.token)
      }
      return `${apiBaseUrl}/package_files/download?${params.toString()}`
    },
    [author, packageName, version, releaseId, apiBaseUrl, session?.token],
  )

  if (isLoading) {
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
