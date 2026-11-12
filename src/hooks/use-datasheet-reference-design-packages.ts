import { useQuery } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"
import { useApiBaseUrl } from "./use-packages-base-api-url"

type ReferenceDesign = { name: string; package_release_id: string }

export function useDatasheetReferenceDesignPackages(chipName: string) {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const query = useQuery(
    ["datasheetReferenceDesigns", apiBaseUrl, token, chipName],
    async () => {
      const { data } = await axios.get<{
        reference_designs: ReferenceDesign[]
      }>("/datasheets/list_reference_designs", {
        params: { chip_name: chipName },
      })
      return data.reference_designs
    },
    {
      enabled: Boolean(chipName),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  )
  return {
    referenceDesigns: query.data ?? [],
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
