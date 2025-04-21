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
    // For "all", use a very old date
    sinceDate = new Date(0)
  }

  // Get all snippets first
  const allSnippets = ctx.db.getTrendingSnippets(20, sinceDate.toISOString())

  // Filter by tag if provided
  const filteredSnippets = tag
    ? allSnippets.filter((snippet) => snippet.snippet_type === tag)
    : allSnippets

  return ctx.json({ snippets: filteredSnippets })
})
