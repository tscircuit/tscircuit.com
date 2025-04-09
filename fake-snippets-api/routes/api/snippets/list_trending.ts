import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  jsonResponse: z.object({
    snippets: z.array(snippetSchema),
  }),
})(async (req, ctx) => {
  console.log(new URL(req.url))
  if (new URL(req.url).searchParams.get("tag") == "keyboard") {
    return ctx.json({
      snippets: [],
    })
  }
  // Get trending snippets from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const trendingSnippets = ctx.db.getTrendingSnippets(
    20,
    sevenDaysAgo.toISOString(),
  )
  return ctx.json({ snippets: trendingSnippets })
})
