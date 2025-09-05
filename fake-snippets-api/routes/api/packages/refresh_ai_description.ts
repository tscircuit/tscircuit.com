import { z } from "zod"
import { packageSchema } from "../../../lib/db/schema"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package: packageSchema,
  }),
})(async (req, ctx) => {
  const { package_id } = req.jsonBody

  const existingPackage = ctx.db.packages.find(
    (p) => p.package_id === package_id,
  )

  if (!existingPackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  // Check if user has permission to refresh AI description
  if (existingPackage.owner_github_username !== ctx.auth.github_username) {
    return ctx.error(403, {
      error_code: "forbidden",
      message:
        "You don't have permission to refresh this package's AI description",
    })
  }

  // In a real implementation, this would call an AI service to generate new descriptions
  // For the fake API, we'll update with new placeholder content
  const updatedPackage = ctx.db.updatePackage(package_id, {
    ai_description: `Updated AI description for ${existingPackage.unscoped_name} - ${new Date().toISOString()}`,
    ai_usage_instructions: `Updated usage instructions for ${existingPackage.unscoped_name} - ${new Date().toISOString()}`,
    updated_at: new Date().toISOString(),
  })

  if (!updatedPackage) {
    return ctx.error(500, {
      error_code: "refresh_failed",
      message: "Failed to refresh AI description",
    })
  }

  return ctx.json({
    ok: true,
    package: updatedPackage,
  })
})
