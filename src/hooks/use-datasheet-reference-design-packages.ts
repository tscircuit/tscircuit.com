import { useQuery } from "react-query"
import { useAxios } from "./use-axios"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { useGlobalStore } from "./use-global-store"
import { datasheetReferenceDesignPackageNames } from "@/lib/datasheet-reference-design-packages"
import {
  loadReferenceDesignCatalog,
  referenceDesignsForPart,
} from "@/lib/reference-design-catalog"

export function useDatasheetReferenceDesignPackages(chipName: string) {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const query = useQuery(
    [
      "datasheetReferenceDesignCatalog",
      apiBaseUrl,
      token,
      datasheetReferenceDesignPackageNames,
    ],
    () =>
      loadReferenceDesignCatalog(
        datasheetReferenceDesignPackageNames,
        axios.get.bind(axios),
      ),
    { staleTime: 5 * 60_000, refetchOnWindowFocus: false, retry: false },
  )
  return {
    packages: referenceDesignsForPart(
      query.data?.entries ?? [],
      datasheetReferenceDesignPackageNames,
      chipName,
    ),
    failed: query.data?.failed ?? [],
    refetch: query.refetch,
  }
}
