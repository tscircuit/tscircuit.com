import { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"

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
      if (!data?.ok) {
        throw new Error("Failed to trigger rebuild")
      }
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
            error?.data?.error?.message || "Failed to rebuild package.",
          variant: "destructive",
        })
      },
    },
  )
}
