import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      package_id: z.string(),
    })
    .or(z.object({ name: z.string() })),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  let packageId: string

  // Get package ID either directly or by name
  if ("package_id" in req.jsonBody) {
    const body = req.jsonBody
    packageId = body.package_id
  } else {
    // If name is provided, look up the package_id
    const body = req.jsonBody
    const packageData = ctx.db.packages.find((pkg) => pkg.name === body.name)

    if (!packageData) {
      return ctx.error(404, {
        error_code: "package_not_found",
        message: "Package not found",
      })
    }

    packageId = packageData.package_id
  }

  // Check if package exists (extra check for ID-based lookup)
  const pkg = ctx.db.packages.find((p) => p.package_id === packageId)

  if (!pkg) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  // Check if already starred
  const existing = ctx.db.accountPackages.find(
    (ap) =>
      ap.account_id === ctx.auth.account_id && ap.package_id === packageId,
  )

  if (!existing?.is_starred) {
    return ctx.error(400, {
      error_code: "not_starred",
      message: "You have not starred this package",
    })
  }

  // Update the package's star count
  pkg.star_count = Math.max(0, (pkg.star_count || 0) - 1)

  // Remove star by updating is_starred to false
  existing.is_starred = false
  existing.updated_at = new Date().toISOString()

  return ctx.json({
    ok: true,
  })
})
