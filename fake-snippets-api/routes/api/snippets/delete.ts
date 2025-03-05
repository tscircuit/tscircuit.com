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

  const snippetIndex = ctx.db.packages.findIndex(
    (s) => s.package_id === snippet_id,
  )

  if (snippetIndex === -1) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  const snippet = ctx.db.packages[snippetIndex]

  if (snippet.creator_account_id !== ctx.auth.github_username) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to delete this snippet",
    })
  }

  ctx.db.packages.splice(snippetIndex, 1)

  return ctx.json({
    ok: true,
  })
})
