import type { AiReview, PackageRelease } from "fake-snippets-api/lib/db/schema"
import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./useAxios"
import { useToast } from "./useToast"

export const useRequestAiReviewMutation = ({
  onSuccess,
}: {
  onSuccess?: (packageRelease: PackageRelease, aiReview: AiReview) => void
} = {}) => {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation(
    async ({ package_release_id }: { package_release_id: string }) => {
      const { data: createData } = await axios.post("/ai_reviews/create", {
        package_release_id,
      })
      const ai_review = createData.ai_review as AiReview

      const { data } = await axios.post(
        "/package_releases/get",
        { package_release_id },
        { params: { include_ai_review: true } },
      )

      return {
        package_release: data.package_release as PackageRelease,
        ai_review,
      }
    },
    {
      onSuccess: ({ package_release, ai_review }) => {
        toast({
          title: "AI review requested",
          description: "An AI review has been requested.",
        })
        queryClient.invalidateQueries(["packageRelease"])
        onSuccess?.(package_release, ai_review)
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
