import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    snippet_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { snippet_id } = req.jsonBody

  // Check if snippet exists (as a package)
  const snippet = ctx.db.packages.find(
    (pkg) => pkg.package_id === snippet_id && pkg.is_snippet === true
  )
  
  if (!snippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  // Check if already starred
  const existing = ctx.db.accountPackages.find(
    (ap) => ap.account_id === ctx.auth.account_id && ap.package_id === snippet_id
  )

  if (existing?.is_starred) {
    return ctx.error(400, {
      error_code: "already_starred",
      message: "You have already starred this snippet",
    })
  }

  // Update the package's star count
  snippet.star_count = (snippet.star_count || 0) + 1

  if (existing) {
    // If record exists but is_starred is false, update to is_starred=true
    existing.is_starred = true
    existing.updated_at = new Date().toISOString()
  } else {
    // Add star by creating a new account_package record
    const newAccountPackage = {
      account_package_id: `ap_${Math.random().toString(36).substring(2, 15)}`,
      account_id: ctx.auth.account_id,
      package_id: snippet_id,
      is_starred: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    ctx.db.addAccountPackage(newAccountPackage)
  }

  return ctx.json({
    ok: true,
  })
})
