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

  const permissions = ctx.db.getPackagePermissions(package_id, ctx.auth)
  if (!permissions.can_manage_package) {
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
