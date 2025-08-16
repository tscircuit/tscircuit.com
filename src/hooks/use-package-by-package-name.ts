import { useQuery, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const usePackageByName = (packageName: string | null) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useQuery<Package, Error & { status: number }>(
    ["package", packageName],
    async () => {
      if (!packageName) return
      const { data } = await axios.get("/packages/get", {
        params: {
          name: packageName,
        },
      })
      const packageData = data.package

      // Also cache this package data under its ID for future usePackageById calls
      if (packageData?.package_id) {
        queryClient.setQueryData(
          ["package", packageData.package_id],
          packageData,
        )
      }

      return packageData
    },
    {
      retry: false,
      enabled: Boolean(packageName),
      refetchOnWindowFocus: false,
    },
  )
}
