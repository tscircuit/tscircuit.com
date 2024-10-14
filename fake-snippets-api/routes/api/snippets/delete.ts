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
  }),
})(async (req, ctx) => {
  const { snippet_id } = req.jsonBody

  const snippetIndex = ctx.db.snippets.findIndex(
    (s) => s.snippet_id === snippet_id
  )

  if (snippetIndex === -1) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  const snippet = ctx.db.snippets[snippetIndex]

  if (snippet.owner_name !== ctx.auth.github_username) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to delete this snippet",
    })
  }

  ctx.db.snippets.splice(snippetIndex, 1)

  return ctx.json({
    ok: true,
  })
})
