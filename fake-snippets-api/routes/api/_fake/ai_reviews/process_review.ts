import { aiReviewSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    ai_review_id: z.string(),
  }),
  jsonResponse: z.object({
    ai_review: aiReviewSchema,
  }),
})(async (req, ctx) => {
  const { ai_review_id } = req.jsonBody
  const existing = ctx.db.getAiReviewById(ai_review_id)
  if (!existing) {
    return ctx.error(404, {
      error_code: "ai_review_not_found",
      message: "AI review not found",
    })
  }
  const now = new Date().toISOString()
  const updated = ctx.db.updateAiReview(ai_review_id, {
    ai_review_text: "Placeholder AI Review",
    start_processing_at: existing.start_processing_at ?? now,
    finished_processing_at: now,
    display_status: "completed",
  })!
  return ctx.json({ ai_review: updated })
})
