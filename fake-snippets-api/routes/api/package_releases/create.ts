import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_name_with_version: z.string(),
  }),
  jsonResponse: z.object({
    package_release: packageReleaseSchema.optional(),
  }),
})(async (req, ctx) => {
  const [name, version] = req.jsonBody.package_name_with_version.split("@")

  const existingPackage = ctx.db.packages.find((pkg) => name === pkg.name)

  if (!existingPackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: `Package not found`,
    })
  }

  const exisitngRelease = ctx.db.packageReleases.find((release) => {
    return (
      release.package_id === existingPackage.package_id &&
      release.version === version
    )
  })

  if (exisitngRelease) {
    return ctx.error(500, {
      error_code: "internal_server_error",
      message: `"duplicate key value violates unique constraint \"package_id_version_unq\""`,
    })
  }

  const newPackage = ctx.db.addPackageRelease({
    package_id: existingPackage.package_id,
    version: version,
  })

  if (!newPackage) {
    return ctx.error(500, {
      error_code: "internal_server_error",
      message: "Failed to create package",
    })
  }

  return ctx.json({
    package_release: newPackage,
  })
})
