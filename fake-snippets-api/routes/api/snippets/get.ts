import { snippetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
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

  // First try to find by snippet_id
  if (snippet_id) {
    const foundSnippet = ctx.db.getSnippetById(snippet_id, ctx.auth)
    if (foundSnippet) {
      if (ctx.auth) {
        foundSnippet.is_starred = ctx.db.hasStarred(
          ctx.auth.account_id,
          foundSnippet.snippet_id,
        )
      }
      return ctx.json({
        ok: true,
        snippet: foundSnippet,
      })
    }
  }

  // If not found by ID, try to find by other parameters
  const foundPackage = ctx.db.packages.find((pkg) => {
    if (!pkg.is_snippet) return false
    if (name && pkg.name.toLowerCase() !== name.toLowerCase()) return false
    if (
      owner_name &&
      pkg.owner_github_username?.toLowerCase() !== owner_name.toLowerCase()
    )
      return false
    if (
      unscoped_name &&
      pkg.unscoped_name.toLowerCase() !== unscoped_name.toLowerCase()
    )
      return false
    return true
  })

  if (!foundPackage) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: `Snippet not found (searched using ${JSON.stringify(req.commonParams)})`,
    })
  }

  // Convert package to snippet format
  const snippet = ctx.db.getSnippetById(foundPackage.package_id)
  if (!snippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: `Snippet not found (searched using ${JSON.stringify(req.commonParams)})`,
    })
  }

  if (ctx.auth) {
    snippet.is_starred = ctx.db.hasStarred(
      ctx.auth.account_id,
      snippet.snippet_id,
    )
  }

  return ctx.json({
    ok: true,
    snippet,
  })
})
