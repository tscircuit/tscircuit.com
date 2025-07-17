import { useMutation, useQuery, useQueryClient } from "react-query"
import { useAxios } from "./useAxios"

type PackageStarQuery = { package_id: string } | { name: string }

interface PackageStarResponse {
  is_starred: boolean
  star_count: number
}

export const usePackageStars = (query: PackageStarQuery | null) => {
  const axios = useAxios()

  return useQuery<PackageStarResponse, Error & { status: number }>(
    ["packageStars", query],
    async () => {
      if (!query) {
        throw new Error("Query is required")
      }

      const { data } = await axios.get("/packages/get", {
        params: query,
      })

      return {
        is_starred: data.package.is_starred ?? false,
        star_count: data.package.star_count ?? 0,
      }
    },
    {
      retry: false,
      enabled: Boolean(query),
    },
  )
}

export const usePackageStarMutation = (query: PackageStarQuery) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  const addStar = useMutation(
    async () => {
      const { data } = await axios.post("/packages/add_star", query)
      return data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["packageStars", query])
      },
    },
  )

  const removeStar = useMutation(
    async () => {
      const { data } = await axios.post("/packages/remove_star", query)
      return data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["packageStars", query])
      },
    },
  )

  return {
    addStar,
    removeStar,
  }
}

// Convenience hooks for common use cases
export const usePackageStarsById = (packageId: string | null) => {
  return usePackageStars(packageId ? { package_id: packageId } : null)
}

export const usePackageStarsByName = (packageName: string | null) => {
  return usePackageStars(packageName ? { name: packageName } : null)
}

export const usePackageStarMutationById = (packageId: string) => {
  return usePackageStarMutation({ package_id: packageId })
}

export const usePackageStarMutationByName = (packageName: string) => {
  return usePackageStarMutation({ name: packageName })
}
