import { accountSnippetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

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

  // Remove star
  ctx.db.removeStar(ctx.auth.account_id, snippet_id)

  // parse account snippet
  const accountSnippet = {
    account_id: ctx.auth.account_id,
    snippet_id,
    has_starred: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return ctx.json({
    ok: true,
    account_snippet: accountSnippetSchema.parse(accountSnippet),
  })
})
