import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { aiReviewSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonResponse: z.object({
    ai_review: aiReviewSchema,
  }),
})(async (req, ctx) => {
  const ai_review = ctx.db.addAiReview({
    ai_review_text: null,
    start_processing_at: null,
    finished_processing_at: null,
    processing_error: null,
    created_at: new Date().toISOString(),
    display_status: "pending",
  })

  return ctx.json({ ai_review })
})
