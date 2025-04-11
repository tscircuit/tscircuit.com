import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"

export const useUpdatePackageLicenseMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation(
    ["updatePackageLicense"],
    async ({
      package_release_id,
      license,
    }: {
      package_release_id: string
      license: string
    }) => {
      const { data } = await axios.post("/package_releases/update", {
        package_release_id,
        license,
      })

      if (!data.ok) {
        throw new Error("Failed to update package license")
      }

      return data
    },
    {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries("packageRelease")
        queryClient.invalidateQueries("currentPackageInfo")
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error updating package license:", error)
      },
    },
  )
} 