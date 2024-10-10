import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    snippet_id: z.string().optional(),
    name: z.string().optional(),
    owner_name: z.string().optional(),
    unscoped_name: z.string().optional(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippet: snippetSchema,
  }),
})(async (req, ctx) => {
  const { snippet_id, name, owner_name, unscoped_name } = req.commonParams

  const foundSnippet = ctx.db.snippets.find(
    (s) =>
      (snippet_id && s.snippet_id === snippet_id) ||
      (name && s.name === name) ||
      (owner_name && s.owner_name === owner_name) ||
      (unscoped_name && s.unscoped_name === unscoped_name),
  )

  if (!foundSnippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: `Snippet not found (searched using ${JSON.stringify(req.commonParams)})`,
    })
  }

  return ctx.json({
    ok: true,
    snippet: foundSnippet,
  })
})
