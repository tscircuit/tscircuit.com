import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageFiles } from "@/hooks/use-package-files"
import {
  getDefaultPreviewFilePath,
  getPreviewCircuitFiles,
  normalizePreviewPath,
} from "@/lib/preview-circuit-files"
import { useAxios } from "@/hooks/use-axios"
import { useCurrentPackageId } from "@/hooks/use-current-package-id"
import { useUrlParams } from "@/hooks/use-url-params"
import { useQuery } from "react-query"
import { useParams } from "wouter"

type PreviewCircuitJsonResponse = {
  preview_circuit_json_response: {
    circuit_json?: any[]
    component_path?: string
    circuit_json_found: boolean
  }
}

export function useCurrentPackageCircuitJson() {
  const { packageId } = useCurrentPackageId()
  const urlParams = useUrlParams()
  const { author, packageName } = useParams()
  const axios = useAxios()

  const version = urlParams.version
  const releaseId = urlParams.package_release_id
  const { packageRelease } = useCurrentPackageRelease()
  const { data: packageFiles, isFetched: areFilesFetched } = usePackageFiles(
    packageRelease?.package_release_id,
    // Viewer mounts must not restart the file query and unmount the 3D fallback.
    { refetchOnMount: false },
  )
  const previewFiles = getPreviewCircuitFiles(packageFiles)
  // A link from another release must never select a file outside this release.
  const selectedFile = previewFiles.find(
    (file) => normalizePreviewPath(file.file_path) === urlParams.preview_file,
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
    async () => {
      if (!query) {
        throw new Error("Missing package release info")
      }

      if (selectedFile) {
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
      enabled: Boolean(query) && (!urlParams.preview_file || areFilesFetched),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 60_000 * 2,
      cacheTime: 60_000 * 2,
    },
  )

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
