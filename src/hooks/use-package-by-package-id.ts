import { useQuery, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const usePackageById = (packageId: string | null) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useQuery<Package, Error & { status: number }>(
    ["package", packageId],
    async () => {
      if (!packageId) return
      const { data } = await axios.get("/packages/get", {
        params: {
          package_id: packageId,
        },
      })
      const packageData = data.package

      // Also cache this package data under its name for future usePackageByName calls
      if (packageData?.name) {
        queryClient.setQueryData(["package", packageData.name], packageData)
      }

      return packageData
    },
    {
      retry: false,
      enabled: Boolean(packageId),
      refetchOnWindowFocus: false,
    },
  )
}
