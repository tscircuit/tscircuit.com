import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const usePackageById = (packageId: string | null) => {
  const axios = useAxios()
  return useQuery<Package, Error & { status: number }>(
    ["package", packageId],
    async () => {
      if (!packageId) return
      const { data } = await axios.get("/packages/get", {
        params: {
          package_id: packageId,
        },
      })
      return data.package
    },
    {
      retry: false,
      enabled: Boolean(packageId),
    }
  )
}