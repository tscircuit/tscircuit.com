import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { aiReviewSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    ai_review_id: z.string(),
  }),
  jsonResponse: z.object({
    ai_review: aiReviewSchema,
  }),
})(async (req, ctx) => {
  const { ai_review_id } = req.query
  const ai_review = ctx.db.getAiReviewById(ai_review_id)
  if (!ai_review) {
    return ctx.error(404, {
      error_code: "ai_review_not_found",
      message: "AI review not found",
    })
  }
  return ctx.json({ ai_review })
})
