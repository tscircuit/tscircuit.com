import { useAxios } from "@/hooks/useAxios"
import type { Package, Snippet } from "fake-snippets-api/lib/db/schema"
import { useQuery } from "react-query"

export const usePackage = (packageId: string | null) => {
  const axios = useAxios()
  return useQuery<Package, Error & { status: number }>(
    ["packages", packageId],
    async () => {
      if (!packageId) {
        throw new Error("Package ID is required")
      }
      const { data } = await axios.get("/packages/get", {
        params: { package_id: packageId },
      })
      return data.package
    },
    {
      enabled: Boolean(packageId),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
