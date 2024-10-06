import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    unscoped_name: z.string().optional(),
    code: z.string().optional(),
    snippet_type: z.enum(["board", "package", "model", "footprint"]),
    description: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippet: snippetSchema,
  }),
})(async (req, ctx) => {
  let {
    unscoped_name,
    code = "",
    snippet_type,
    description = "",
  } = req.jsonBody
  if (!unscoped_name) {
    unscoped_name = `untitled-${snippet_type}-${ctx.db.idCounter + 1}`
  }
  const newSnippet = {
    snippet_id: `snippet_${ctx.db.idCounter + 1}`,
    name: `${ctx.auth.github_username}/${unscoped_name}`,
    unscoped_name,
    owner_name: ctx.auth.github_username,
    code,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type,
    description,
  }

  ctx.db.addSnippet(newSnippet)

  return ctx.json({
    ok: true,
    snippet: newSnippet,
  })
})
