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
    ["previewCircuitJson", query],
    async () => {
      if (!query) {
        throw new Error("Missing package release info")
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
      enabled: Boolean(query),
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

  return { circuitJson, circuitJsonFound, isLoading, error: errorMessage }
}
