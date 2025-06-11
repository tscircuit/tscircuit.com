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
      return data.package_release as PackageRelease
    },
    {
      onMutate: async ({ package_release_id }) => {
        // Optimistically clear logs for the package release so the UI doesn't
        // show stale logs while the rebuild request is in flight
        await queryClient.setQueriesData<PackageRelease | undefined>(
          { queryKey: ["packageRelease"] },
          (old) => {
            if (!old) return old
            if (old.package_release_id !== package_release_id) return old
            return {
              ...old,
              circuit_json_build_logs: [],
              transpilation_logs: [],
              circuit_json_build_error: null,
              transpilation_error: null,
            }
          },
        )
      },
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
            error?.response?.data?.message ||
            error?.data?.message ||
            "Failed to rebuild package.",
          variant: "destructive",
        })
      },
    },
  )
}
