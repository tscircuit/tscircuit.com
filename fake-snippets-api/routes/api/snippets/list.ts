import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    owner_name: z.string().optional(),
    unscoped_name: z.string().optional(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippets: z.array(snippetSchema),
  }),
})(async (req, ctx) => {
  const { owner_name, unscoped_name } = req.commonParams

  console.log(ctx.db.snippets)
  const snippets = ctx.db
    .getSnippetsByAuthor(owner_name)
    .filter((s) => !unscoped_name || s.unscoped_name === unscoped_name)

  return ctx.json({
    ok: true,
    snippets,
  })
})
