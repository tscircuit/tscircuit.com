import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    snippet_id: z.string(),
    code: z.string().optional(),
    description: z.string().optional(),
    unscoped_name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippet: snippetSchema.extend({
      snippet_type: z.enum(["board", "package", "model", "footprint"]),
    }),
  }),
})(async (req, ctx) => {
  const { snippet_id, code, description, unscoped_name } = req.jsonBody

  const snippetIndex = ctx.db.snippets.findIndex(
    (s) => s.snippet_id === snippet_id,
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
      message: "You don't have permission to update this snippet",
    })
  }

  const updatedSnippet = {
    ...snippet,
    code: code ?? snippet.code,
    description: description ?? snippet.description,
    unscoped_name: unscoped_name ?? snippet.unscoped_name,
    name: unscoped_name
      ? `${ctx.auth.github_username}/${unscoped_name}`
      : snippet.name,
    updated_at: new Date().toISOString(),
  }

  ctx.db.snippets[snippetIndex] = updatedSnippet

  return ctx.json({
    ok: true,
    snippet: updatedSnippet,
  })
})
