import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { aiReviewSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    ai_reviews: z.array(aiReviewSchema),
  }),
})(async (req, ctx) => {
  const ai_reviews = ctx.db.listAiReviews()
  return ctx.json({ ai_reviews })
})
