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

  // Check if snippet exists
  const snippet = ctx.db.getSnippetById(snippet_id)
  if (!snippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  // Check if already starred
  if (ctx.db.hasStarred(ctx.auth.account_id, snippet_id)) {
    return ctx.error(400, {
      error_code: "already_starred",
      message: "You have already starred this snippet",
    })
  }

  // Add star
  const accountSnippet = ctx.db.addStar(ctx.auth.account_id, snippet_id)

  return ctx.json({
    ok: true,
    account_snippet: accountSnippet,
  })
})