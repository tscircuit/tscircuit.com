import { CadViewer } from "@tscircuit/3d-viewer"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useUrlParams } from "@/hooks/use-url-params"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "wouter"
import type { AnyCircuitElement } from "circuit-json"

const NODE_MODULES_TSCI_PACKAGE_ASSET_REGEX =
  /^\.?\/?node_modules\/@tsci\/([^/.]+)\.([^/]+)\/(.+)$/

const normalizeAssetPath = (assetPath: string) =>
  assetPath.startsWith("./") ? assetPath.slice(2) : assetPath

const getPackageFileLookupParams = ({
  assetUrl,
  releaseId,
  author,
  packageName,
  version,
}: {
  assetUrl: string
  releaseId?: string
  author?: string
  packageName?: string
  version?: string
}): Record<string, string> | null => {
  const normalizedAssetUrl = normalizeAssetPath(assetUrl)
  const externalPackageMatch = normalizedAssetUrl.match(
    NODE_MODULES_TSCI_PACKAGE_ASSET_REGEX,
  )

  if (externalPackageMatch) {
    const [, externalAuthor, externalPackageName, filePath] = externalPackageMatch
    return {
      package_name_with_version: `${externalAuthor}/${externalPackageName}@latest`,
      file_path: filePath,
    }
  }

  if (releaseId) {
    return {
      package_release_id: releaseId,
      file_path: assetUrl,
    }
  }

  if (author && packageName) {
    return {
      package_name_with_version: `${author}/${packageName}@${version || "latest"}`,
      file_path: assetUrl,
    }
  }

  return null
}

function useModelBlobUrls(circuitJson: AnyCircuitElement[] | null) {
  const { author, packageName } = useParams()
  const urlParams = useUrlParams()
  const apiBaseUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)

  const version = urlParams.version
  const releaseId = urlParams.package_release_id

  const assetUrls = useMemo(() => {
    if (!circuitJson) return []
    const urls = new Set<string>()
    for (const element of circuitJson) {
      if (element.type !== "cad_component") continue
      for (const value of Object.values(element)) {
        if (typeof value === "string" && value.includes(".")) {
          urls.add(value)
        }
      }
    }
    return Array.from(urls)
  }, [circuitJson])

  const [blobUrlMap, setBlobUrlMap] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (assetUrls.length === 0) return

    let cancelled = false
    const blobUrls: string[] = []

    const fetchModels = async () => {
      setIsLoading(true)
      const map: Record<string, string> = {}

      await Promise.all(
        assetUrls.map(async (assetUrl) => {
          const lookupParams = getPackageFileLookupParams({
            assetUrl,
            releaseId,
            author,
            packageName,
            version,
          })
          if (!lookupParams) return

          const params = new URLSearchParams(lookupParams)

          const headers: Record<string, string> = {}
          if (session?.token) {
            headers.Authorization = `Bearer ${session.token}`
          }

          try {
            const response = await fetch(
              `${apiBaseUrl}/package_files/download?${params.toString()}`,
              { headers },
            )
            if (!response.ok) return
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            blobUrls.push(blobUrl)
            map[assetUrl] = blobUrl
            map[normalizeAssetPath(assetUrl)] = blobUrl
          } catch {
            // Skip models that fail to load
          }
        }),
      )

      if (!cancelled) {
        setBlobUrlMap(map)
        setIsLoading(false)
      }
    }

    fetchModels()

    return () => {
      cancelled = true
      for (const url of blobUrls) {
        URL.revokeObjectURL(url)
      }
    }
  }, [
    assetUrls,
    releaseId,
    author,
    packageName,
    version,
    apiBaseUrl,
    session?.token,
  ])

  const resolveStaticAsset = useCallback(
    (assetPath: string) => blobUrlMap[assetPath] ?? assetPath,
    [blobUrlMap],
  )

  return { resolveStaticAsset, isLoading }
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
