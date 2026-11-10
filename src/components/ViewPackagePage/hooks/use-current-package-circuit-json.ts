import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageFiles } from "@/hooks/use-package-files"
import {
  getDefaultPreviewFilePath,
  getPreviewCircuitFiles,
  normalizePreviewPath,
} from "@/lib/preview-circuit-files"
import { useAxios } from "@/hooks/use-axios"
import { useCurrentPackageId } from "@/hooks/use-current-package-id"
import { useQuery } from "react-query"
import { usePackagePreviewIdentity } from "@/components/PackagePreviewScope"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useGlobalStore } from "@/hooks/use-global-store"
import { downloadPackageCircuitJson } from "@/lib/download-package-circuit-json"

type PreviewCircuitJsonResponse = {
  preview_circuit_json_response: {
    circuit_json?: any[]
    component_path?: string
    circuit_json_found: boolean
  }
}

export function useCurrentPackageCircuitJson() {
  const { packageId } = useCurrentPackageId()
  const { author, packageName, version, releaseId, previewFilePath, preview } =
    usePackagePreviewIdentity()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((state) => state.session?.token)
  const axios = useAxios()

  const { packageRelease } = useCurrentPackageRelease({
    refetchOnMount: preview ? false : undefined,
  })
  const { data: packageFiles, isFetched: areFilesFetched } = usePackageFiles(
    packageRelease?.package_release_id,
    // Viewer mounts must not restart the file query and unmount the 3D fallback.
    { refetchOnMount: false },
  )
  const previewFiles = getPreviewCircuitFiles(packageFiles)
  // A link from another release must never select a file outside this release.
  const selectedFile = previewFiles.find(
    (file) => normalizePreviewPath(file.file_path) === previewFilePath,
  )

  let query: Record<string, string | boolean> | null = null

  if (author && packageName && !version && !releaseId) {
    query = { package_name: `${author}/${packageName}`, is_latest: true }
  } else if (releaseId) {
    query = { package_release_id: releaseId }
  } else if (version && author && packageName) {
    query = { package_name_with_version: `${author}/${packageName}@${version}` }
  } else if (packageId) {
    query = { package_id: packageId, is_latest: true }
  }

  const { data, isLoading, error } = useQuery<
    PreviewCircuitJsonResponse,
    Error & { status: number }
  >(
    ["previewCircuitJson", query, selectedFile?.package_file_id],
    async (queryContext) => {
      if (!query) {
        throw new Error("Missing package release info")
      }

      if (selectedFile) {
        if (selectedFile.file_path.endsWith(".gz")) {
          const circuitJson = await downloadPackageCircuitJson({
            apiBaseUrl,
            packageFileId: selectedFile.package_file_id,
            token,
            signal: queryContext.signal,
          })
          return {
            preview_circuit_json_response: {
              circuit_json: circuitJson,
              component_path: normalizePreviewPath(selectedFile.file_path),
              circuit_json_found: true,
            },
          }
        }
        const { data } = await axios.get("/package_files/get", {
          params: { package_file_id: selectedFile.package_file_id },
        })
        const circuitJson = JSON.parse(data.package_file.content_text)
        if (!Array.isArray(circuitJson)) {
          throw new Error("Selected file does not contain a Circuit JSON array")
        }
        return {
          preview_circuit_json_response: {
            circuit_json: circuitJson,
            component_path: normalizePreviewPath(selectedFile.file_path),
            circuit_json_found: true,
          },
        }
      }

      const response = await axios.get<PreviewCircuitJsonResponse>(
        "/package_releases/get_preview_circuit_json",
        {
          params: query,
        },
      )

      return response.data
    },
    {
      enabled:
        !preview && Boolean(query) && (!previewFilePath || areFilesFetched),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 60_000 * 2,
      cacheTime: 60_000 * 2,
    },
  )

  if (preview)
    return {
      circuitJson: preview.circuitJson,
      circuitJsonFound: Boolean(preview.circuitJson),
      packageFiles,
      previewFiles,
      hasPreviewFiles: previewFiles.length > 0,
      previewFilePath: preview.previewFilePath,
      componentPath: preview.previewFilePath,
      isLoading: !preview.circuitJson,
      error: null,
    }

  const circuitJson = data?.preview_circuit_json_response.circuit_json ?? null
  const circuitJsonFound =
    data?.preview_circuit_json_response.circuit_json_found ?? false

  const errorMessage = error
    ? error.message
    : data && !circuitJsonFound
      ? "Circuit JSON not found in package"
      : null

  return {
    circuitJson,
    circuitJsonFound,
    packageFiles,
    previewFiles,
    hasPreviewFiles: previewFiles.length > 0,
    previewFilePath: selectedFile
      ? normalizePreviewPath(selectedFile.file_path)
      : getDefaultPreviewFilePath(
          previewFiles,
          data?.preview_circuit_json_response.component_path,
        ),
    componentPath: selectedFile
      ? normalizePreviewPath(selectedFile.file_path)
      : data?.preview_circuit_json_response.component_path,
    isLoading,
    error: errorMessage,
  }
}
