import { snippetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  jsonResponse: z.object({
    snippets: z.array(snippetSchema),
  }),
})(async (req, ctx) => {
  const latestSnippets = ctx.db.getLatestSnippets(20)
  return ctx.json({ snippets: latestSnippets })
})
