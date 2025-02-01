import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { package_id } = req.jsonBody

  const packageIndex = ctx.db.packages.findIndex(
    (p) => p.package_id === package_id,
  )

  if (packageIndex === -1) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  const pkg = ctx.db.packages[packageIndex]

  console.log("pkg", pkg.owner_org_id, ctx.auth.personal_org_id)

  if (pkg.owner_org_id !== ctx.auth.personal_org_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to delete this package",
    })
  }

  ctx.db.packages.splice(packageIndex, 1)

  return ctx.json({
    ok: true,
  })
})
