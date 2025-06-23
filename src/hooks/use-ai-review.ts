import type { AiReview } from "fake-snippets-api/lib/db/schema"
import { useQuery } from "react-query"
import { useAxios } from "./use-axios"

export const useAiReview = (
  aiReviewId: string | null,
  options?: {
    refetchInterval?:
      | number
      | false
      | ((data: AiReview | undefined) => number | false)
  },
) => {
  const axios = useAxios()

  return useQuery<AiReview, Error & { status: number }>(
    ["aiReview", aiReviewId],
    async () => {
      if (!aiReviewId) throw new Error("aiReviewId is required")
      const { data } = await axios.get("/ai_reviews/get", {
        params: { ai_review_id: aiReviewId },
      })
      return data.ai_review as AiReview
    },
    {
      enabled: Boolean(aiReviewId),
      refetchInterval: options?.refetchInterval,
      refetchOnWindowFocus: false,
    },
  )
}
