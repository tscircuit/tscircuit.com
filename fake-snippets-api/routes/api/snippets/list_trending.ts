import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  jsonResponse: z.object({
    snippets: z.array(snippetSchema),
  }),
  queryParams: z.object({
    timeRange: z.enum(["week", "month", "all"]).optional().default("all"),
    tag: z.string().optional(),
  }),
})(async (req, ctx) => {
  const { timeRange, tag } = req.query

  let sinceDate = new Date()
  if (timeRange === "week") {
    sinceDate.setDate(sinceDate.getDate() - 7)
  } else if (timeRange === "month") {
    sinceDate.setDate(sinceDate.getDate() - 30)
  } else {
    sinceDate = new Date(0) // fetch everything
  }

  // Fetch trending snippets since calculated date
  const allSnippets = ctx.db.getTrendingSnippets(
    20,
    sinceDate.toISOString()
  )


  const filteredSnippets = tag
    ? allSnippets.filter(snippet => snippet.snippet_type === tag)
    : allSnippets

  return ctx.json({ snippets: filteredSnippets })
})
