import { snippetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  queryParams: z.object({
    q: z.string(),
  }),
  jsonResponse: z.object({
    snippets: z.array(snippetSchema),
  }),
})(async (req, ctx) => {
  const { q } = req.query
  const snippets = ctx.db.searchSnippets(q)
  return ctx.json({ snippets })
})
