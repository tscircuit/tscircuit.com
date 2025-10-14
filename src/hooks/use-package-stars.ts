import { useMutation, useQuery, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"
import { usePackageByName } from "./use-package-by-package-name"
import { usePackageById } from "./use-package-by-package-id"

type PackageStarQuery = { package_id: string } | { name: string }

interface PackageStarResponse {
  is_starred: boolean
  star_count: number
}

export const usePackageStars = (query: PackageStarQuery | null) => {
  const packageName = query && "name" in query ? query.name : null
  const packageId = query && "package_id" in query ? query.package_id : null
  const packageQuery = packageName
    ? usePackageByName(packageName)
    : usePackageById(packageId)

  return useQuery<PackageStarResponse, Error & { status: number }>(
    ["packageStars", query],
    async () => {
      if (!query) {
        throw new Error("Query is required")
      }
      return {
        is_starred: packageQuery.data?.is_starred ?? false,
        star_count: packageQuery.data?.star_count ?? 0,
      }
    },
    {
      retry: false,
      enabled: Boolean(query) && packageQuery.isSuccess,
    },
  )
}

export const usePackageStarMutation = (query: PackageStarQuery) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  const addStar = useMutation<
    any,
    Error,
    void,
    { previousStars?: PackageStarResponse }
  >(
    async () => {
      const { data } = await axios.post("/packages/add_star", query)
      return data
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries(["packageStars", query])
        const previousStars = queryClient.getQueryData<PackageStarResponse>([
          "packageStars",
          query,
        ])
        const optimistic: PackageStarResponse = {
          is_starred: true,
          star_count: (previousStars?.star_count ?? 0) + 1,
        }
        queryClient.setQueryData(["packageStars", query], optimistic)
        return { previousStars }
      },
      onError: (_error, _vars, context) => {
        if (context?.previousStars) {
          queryClient.setQueryData(
            ["packageStars", query],
            context.previousStars,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(["packageStars", query])
      },
    },
  )

  const removeStar = useMutation<
    any,
    Error,
    void,
    { previousStars?: PackageStarResponse }
  >(
    async () => {
      const { data } = await axios.post("/packages/remove_star", query)
      return data
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries(["packageStars", query])
        const previousStars = queryClient.getQueryData<PackageStarResponse>([
          "packageStars",
          query,
        ])
        const optimistic: PackageStarResponse = {
          is_starred: false,
          star_count: Math.max(0, (previousStars?.star_count ?? 1) - 1),
        }
        queryClient.setQueryData(["packageStars", query], optimistic)
        return { previousStars }
      },
      onError: (_error, _vars, context) => {
        if (context?.previousStars) {
          queryClient.setQueryData(
            ["packageStars", query],
            context.previousStars,
          )
        }
      },
      onSettled: () => {
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

// High-level hook that exposes current star state and a single toggle action
export const usePackageStarring = (query: PackageStarQuery | null) => {
  const starsQuery = usePackageStars(query)
  const mutations = usePackageStarMutation(query ?? { name: "" })

  const toggleStar = async () => {
    if (!query) return
    const currentlyStarred = starsQuery.data?.is_starred ?? false
    if (currentlyStarred) await mutations.removeStar.mutateAsync()
    else await mutations.addStar.mutateAsync()
  }

  return {
    isStarred: starsQuery.data?.is_starred ?? false,
    starCount: starsQuery.data?.star_count ?? 0,
    isPending: mutations.addStar.isLoading || mutations.removeStar.isLoading,
    toggleStar,
  }
}

export const usePackageStarringByName = (packageName: string | null) => {
  return usePackageStarring(packageName ? { name: packageName } : null)
}
