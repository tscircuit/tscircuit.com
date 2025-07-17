import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./useAxios"
import { useToast } from "./useToast"

export const useRebuildPackageReleaseMutation = ({
  onSuccess,
}: { onSuccess?: (packageRelease: PackageRelease) => void } = {}) => {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation(
    async ({ package_release_id }: { package_release_id: string }) => {
      const { data } = await axios.post("/package_releases/rebuild", {
        package_release_id,
      })
      return data.package_release as PackageRelease
    },
    {
      onSuccess: (pkgRelease) => {
        toast({
          title: "Rebuild triggered",
          description: "The package build has been queued for rebuild.",
        })
        queryClient.invalidateQueries(["packageRelease"])
        onSuccess?.(pkgRelease)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description:
            error?.response?.data?.error?.message ||
            error?.data?.error?.message ||
            "Failed to rebuild package.",
          variant: "destructive",
        })
      },
    },
  )
}
