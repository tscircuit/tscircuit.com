import { useQuery } from "react-query"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useAxios } from "@/hooks/use-axios"

const RELATED_PACKAGES_CACHE_TIME = 48 * 60 * 60 * 1000

export type RelatedPackage = Package & {
  related_type: "same_author" | "similar_ai_description" | "random"
  thumbnail_url: string
}

export const useRelatedPackages = (
  packageId: string | null,
  enabled: boolean,
) => {
  const axios = useAxios()

  return useQuery<RelatedPackage[]>(
    ["relatedPackages", packageId],
    async () => {
      const response = await axios.get("/packages/list_related_packages", {
        params: { package_id: packageId },
      })
      return response.data.packages
    },
    {
      enabled: Boolean(packageId) && enabled,
      retry: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: RELATED_PACKAGES_CACHE_TIME,
      cacheTime: RELATED_PACKAGES_CACHE_TIME,
    },
  )
}
