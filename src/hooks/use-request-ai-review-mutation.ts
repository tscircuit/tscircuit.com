import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"
import type { PackageRelease } from "fake-snippets-api/lib/db/schema"

export const useRequestAiReviewMutation = ({
  onSuccess,
}: { onSuccess?: (packageRelease: PackageRelease) => void } = {}) => {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation(
    async ({ package_release_id }: { package_release_id: string }) => {
      await axios.post("/ai_reviews/create", null, {
        params: { package_release_id },
      })
      const { data } = await axios.post(
        "/package_releases/get",
        { package_release_id },
        { params: { include_ai_review: true } },
      )
      return data.package_release as PackageRelease
    },
    {
      onSuccess: (packageRelease) => {
        toast({
          title: "AI review requested",
          description: "An AI review has been generated.",
        })
        queryClient.invalidateQueries(["packageRelease"])
        onSuccess?.(packageRelease)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description:
            error?.response?.data?.message ||
            error?.data?.message ||
            "Failed to request AI review.",
          variant: "destructive",
        })
      },
    },
  )
}
