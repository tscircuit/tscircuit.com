import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageFiles } from "@/hooks/use-package-files"
import {
  getDefaultPreviewFilePath,
  getPreviewCircuitFiles,
  normalizePreviewPath,
} from "@/lib/preview-circuit-files"
import { useAxios } from "@/hooks/use-axios"
import { useCurrentPackageId } from "@/hooks/use-current-package-id"
import { usePackagePreviewIdentity } from "@/components/PackagePreviewScope"
import { useQuery, useQueryClient } from "react-query"
import { useCallback } from "react"
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
  const { author, packageName, version, releaseId, previewFilePath } =
    usePackagePreviewIdentity()
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((state) => state.session?.token)

  const { packageRelease } = useCurrentPackageRelease({ refetchOnMount: false })
  const { data: packageFiles, isFetched: areFilesFetched } = usePackageFiles(
    packageRelease?.package_release_id,
    // Viewer mounts must not restart the file query and unmount the 3D fallback.
    { refetchOnMount: false },
  )
  const previewFiles = getPreviewCircuitFiles(packageFiles)
  // A link from another release must never select a file outside this release.
  const explicitFile = previewFiles.find(
    (file) => normalizePreviewPath(file.file_path) === previewFilePath,
  )
  const defaultPath = getDefaultPreviewFilePath(previewFiles)
  const selectedFile =
    explicitFile ??
    (!previewFilePath && defaultPath?.endsWith(".gz")
      ? previewFiles.find(
          (file) => normalizePreviewPath(file.file_path) === defaultPath,
        )
      : undefined)

  let query: Record<string, string | boolean> | null = null

  if (packageRelease?.package_release_id) {
    query = { package_release_id: packageRelease.package_release_id }
  } else if (author && packageName && !version && !releaseId) {
    query = { package_name: `${author}/${packageName}`, is_latest: true }
  } else if (releaseId) {
    query = { package_release_id: releaseId }
  } else if (version && author && packageName) {
    query = { package_name_with_version: `${author}/${packageName}@${version}` }
  } else if (packageId) {
    query = { package_id: packageId, is_latest: true }
  }

  const queryClient = useQueryClient()
  const getQueryOptions = (file: typeof selectedFile) => {
    const selectedFile = file
    return {
      queryKey: [
        "previewCircuitJson",
        query,
        selectedFile?.package_file_id,
        apiBaseUrl,
        token,
      ],
      queryFn: async ({ signal }: { signal?: AbortSignal }) => {
        if (!query) {
          throw new Error("Missing package release info")
        }

        if (selectedFile) {
          if (selectedFile.file_path.endsWith(".gz")) {
            const circuitJson = await downloadPackageCircuitJson({
              apiBaseUrl,
              packageFileId: selectedFile.package_file_id,
              token,
              signal,
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
            throw new Error(
              "Selected file does not contain a Circuit JSON array",
            )
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
      // Release artifacts are immutable; keep visited configurations for this session.
      staleTime: Infinity,
      cacheTime: 5 * 60_000,
      retry: false,
    }
  }
  const { data, isLoading, isPreviousData, error, refetch } = useQuery<
    PreviewCircuitJsonResponse,
    Error & { status: number }
  >({
    ...getQueryOptions(selectedFile),
    enabled: Boolean(query) && areFilesFetched,
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  })
  const prefetchPreview = useCallback(
    (path: string, prepare = false) => {
      const file = packageFiles?.find(
        (file) =>
          normalizePreviewPath(file.file_path) === normalizePreviewPath(path),
      )
      if (query && file)
        return prepare
          ? queryClient.fetchQuery(getQueryOptions(file))
          : queryClient.prefetchQuery(getQueryOptions(file))
    },
    [queryClient, JSON.stringify(query), packageFiles, apiBaseUrl, token],
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
    refetch,
    prefetchPreview,
    packageFiles,
    circuitJson,
    circuitJsonFound,
    previewFiles,
    hasPreviewFiles: previewFiles.length > 0,
    previewFilePath: isPreviousData
      ? getDefaultPreviewFilePath(
          previewFiles,
          data?.preview_circuit_json_response.component_path,
        )
      : selectedFile
        ? normalizePreviewPath(selectedFile.file_path)
        : getDefaultPreviewFilePath(
            previewFiles,
            data?.preview_circuit_json_response.component_path,
          ),
    componentPath: isPreviousData
      ? data?.preview_circuit_json_response.component_path
      : selectedFile
        ? normalizePreviewPath(selectedFile.file_path)
        : data?.preview_circuit_json_response.component_path,
    isLoading: isLoading || !areFilesFetched,
    error: errorMessage,
  }
}
