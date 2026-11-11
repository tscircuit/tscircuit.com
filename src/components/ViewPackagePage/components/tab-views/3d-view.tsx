import { usePackageModelAssets } from "@/hooks/use-package-model-assets"
import { getPackageFileLookupParams } from "@/lib/package-model-assets"
import { CadViewer } from "@tscircuit/3d-viewer"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Suspense, useMemo, type ComponentProps } from "react"
import type { AnyCircuitElement } from "circuit-json"
import { useQuery } from "react-query"
import { usePackagePreviewIdentity } from "@/components/PackagePreviewScope"
import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { findParameterVariantByPath } from "@/lib/package-preview-parameters"
import {
  findPackagePreviewGlb,
  downloadPackagePreviewGlb,
} from "@/lib/package-preview-glb"

function useModelBlobUrls(circuitJson: AnyCircuitElement[] | null) {
  const { author, packageName, version, releaseId } =
    usePackagePreviewIdentity()
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

type ThreeDViewProps = {
  packageFiles?: { file_path: string; package_file_id: string }[]
  arePackageFilesFetched?: boolean
  isFetchingPackageFiles?: boolean
  onViewSchematicComponent?: ComponentProps<
    typeof CadViewer
  >["onViewSchematicComponent"]
}

export default function ThreeDView({
  packageFiles,
  arePackageFilesFetched = false,
  isFetchingPackageFiles = false,
  onViewSchematicComponent,
}: ThreeDViewProps) {
  const { preview } = usePackagePreviewIdentity()
  const { componentPath, previewFilePath, isLoading } =
    useCurrentPackageCircuitJson()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const { manifest } = usePackagePreviewParameters()
  const glb = manifest
    ? packageFiles?.find(
        (file) =>
          file.file_path ===
          findParameterVariantByPath(manifest, previewFilePath).glbPath,
      )
    : findPackagePreviewGlb(packageFiles, componentPath)
  const download = useQuery(
    ["packagePreviewGlb", apiBaseUrl, glb?.package_file_id, token],
    ({ signal }) =>
      downloadPackagePreviewGlb({
        apiBaseUrl,
        packageFileId: glb!.package_file_id,
        token,
        signal,
      }),
    {
      enabled: !preview && arePackageFilesFetched && !isLoading && Boolean(glb),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 120_000,
    },
  )

  const glbBuffer = preview ? preview.glb : download.data
  if (
    !arePackageFilesFetched ||
    isLoading ||
    (!glb && isFetchingPackageFiles) ||
    (!preview && glb && download.isLoading)
  )
    return (
      <div className="h-[620px] flex items-center justify-center">
        Loading 3D view...
      </div>
    )

  if (glbBuffer && glb)
    return (
      <div
        className={
          preview
            ? "h-[620px] [&:has(canvas)_[role=status]]:hidden"
            : "h-[620px]"
        }
      >
        <CadViewer
          glbData={glbBuffer}
          clickToInteractEnabled
          onViewSchematicComponent={onViewSchematicComponent}
        />
      </div>
    )

  // Mount the per-component renderer only when there is no usable assembly.
  return (
    <CircuitJsonThreeDView
      onViewSchematicComponent={onViewSchematicComponent}
    />
  )
}

function CircuitJsonThreeDView({
  onViewSchematicComponent,
}: {
  onViewSchematicComponent?: ComponentProps<
    typeof CadViewer
  >["onViewSchematicComponent"]
}) {
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
          onViewSchematicComponent={onViewSchematicComponent}
        />
      </Suspense>
    </div>
  )
}
