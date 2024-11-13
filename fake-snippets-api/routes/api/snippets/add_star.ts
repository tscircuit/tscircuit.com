import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { accountSnippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    snippet_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    account_snippet: accountSnippetSchema,
  }),
})(async (req, ctx) => {
  const { snippet_id } = req.jsonBody
  const { account_id } = ctx.auth

  // Check if snippet exists
  const snippet = ctx.db.getSnippetById(snippet_id)
  if (!snippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  try {
    // Check current star status
    const hasStarred = ctx.db.hasStarred(account_id, snippet_id)
    let accountSnippet

    const now = new Date().toISOString()

    if (hasStarred) {
      ctx.db.removeStar(account_id, snippet_id)
      accountSnippet = {
        account_id,
        snippet_id,
        has_starred: false,
        created_at: now,
        updated_at: now,
      }
    } else {
      accountSnippet = ctx.db.addStar(account_id, snippet_id)
    }

    return ctx.json({
      ok: true,
      account_snippet: accountSnippetSchema.parse(accountSnippet),
    })
  } catch (error) {
    console.error("Error toggling star:", error)
    return ctx.error(500, {
      error_code: "star_operation_failed",
      message: "Failed to update star status",
    })
  }
})
