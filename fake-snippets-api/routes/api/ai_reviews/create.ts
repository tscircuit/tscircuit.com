import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { aiReviewSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  queryParams: z.object({
    package_release_id: z.string().optional(),
  }),
  jsonResponse: z.object({
    ai_review: aiReviewSchema,
  }),
})(async (req, ctx) => {
  const { package_release_id } = req.query

  if (package_release_id) {
    const release = ctx.db.getPackageReleaseById(package_release_id)
    if (!release) {
      return ctx.error(404, {
        error_code: "package_release_not_found",
        message: "Package release not found",
      })
    }
    ctx.db.updatePackageRelease({
      ...release,
      ai_review_requested: true,
    })
  }

  const ai_review = ctx.db.addAiReview({
    package_release_id: package_release_id,
    ai_review_text: null,
    start_processing_at: null,
    finished_processing_at: null,
    processing_error: null,
    created_at: new Date().toISOString(),
    display_status: "pending",
  })

  return ctx.json({ ai_review })
})
