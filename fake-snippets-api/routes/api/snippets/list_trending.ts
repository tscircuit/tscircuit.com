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
    timeRange: z.enum(["7days", "30days", "all"]).optional().default("all"),
    tag: z.string().optional(),
  }),
})(async (req, ctx) => {
  const { timeRange, tag } = req.query

  let sinceDate = new Date()
  if (timeRange === "7days") {
    sinceDate.setDate(sinceDate.getDate() - 7)
  } else if (timeRange === "30days") {
    sinceDate.setDate(sinceDate.getDate() - 30)
  } else {
    sinceDate = new Date(0) // For "all", use earliest possible date
  }

  const trendingSnippets = ctx.db.getTrendingSnippets(
    20,
    sinceDate.toISOString(),
  )

  // Filter by tag if provided
  const filteredSnippets = tag
    ? trendingSnippets.filter((snippet) => snippet.snippet_type === tag)
    : trendingSnippets

  return ctx.json({ snippets: filteredSnippets })
})
