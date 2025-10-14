import { useQuery, UseQueryOptions } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const usePackageByName = (
  packageName: string | null,
  options?: UseQueryOptions<Package, Error & { status: number }>,
) => {
  const axios = useAxios()
  return useQuery<Package, Error & { status: number }>(
    ["package", packageName],
    async () => {
      if (!packageName) return
      const { data } = await axios.get("/packages/get", {
        params: {
          name: packageName,
        },
      })
      return data.package
    },
    {
      retry: false,
      enabled: Boolean(packageName),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      ...options,
    },
  )
}
