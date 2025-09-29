import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string(),
  }),
  jsonResponse: z.object({
    success: z.boolean(),
  }),
})(async (req, ctx) => {
  const { package_id } = req.jsonBody

  const package_info = ctx.db.getPackageById(package_id)
  if (!package_info) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  const permissions = ctx.db.getPackagePermissions(package_id, ctx.auth)
  if (!permissions.can_manage_package) {
    return ctx.error(403, {
      error_code: "unauthorized",
      message:
        "You don't have permission to update AI description for this package",
    })
  }

  ctx.db.updatePackage(package_id, {
    ai_description: "New ai description",
    ai_usage_instructions: "New ai usage instructions",
  })

  return ctx.json({ success: true })
})
