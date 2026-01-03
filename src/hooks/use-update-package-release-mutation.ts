import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"

export const useUpdatePackageReleaseMutation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation(
    ["updatePackageRelease"],
    async ({
      package_release_id,
      package_name_with_version,
      is_locked,
      is_latest,
      license,
      fs_sha,
      ready_to_build,
      ai_review_requested,
    }: {
      package_release_id?: string
      package_name_with_version?: string
      is_locked?: boolean
      is_latest?: boolean
      license?: string
      fs_sha?: string
      ready_to_build?: boolean
      ai_review_requested?: boolean
    }) => {
      // Validate that either package_release_id or package_name_with_version is provided
      if (!package_release_id && !package_name_with_version) {
        throw new Error(
          "Must provide either package_release_id or package_name_with_version",
        )
      }

      const {
        data: { ok },
      } = await axios.post("/package_releases/update", {
        package_release_id,
        package_name_with_version,
        is_locked,
        is_latest,
        license,
        fs_sha,
        ready_to_build,
        ai_review_requested,
      })

      if (!ok) {
        throw new Error("Failed to update package release")
      }

      return { ok }
    },
    {
      onSuccess: () => {
        // Invalidate relevant queries to refetch updated data
        queryClient.invalidateQueries(["packageReleases"])
        queryClient.invalidateQueries(["packageRelease"])
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error updating package release:", error)
      },
    },
  )
}
