import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "optional_session",
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: packageReleaseSchema.optional(),
  }),
  jsonBody: z.object({
    package_name_with_version: z.string(),
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

  const existingPackageReleases = ctx.db.packageReleases.filter(
    (pkg) => existingPackage?.package_id === pkg.package_id,
  )
  const existingPackageRelease = existingPackageReleases?.find(
    (pkg) => version === pkg.version,
  )

  if (!existingPackageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: `Package release not found`,
    })
  }

  return ctx.json({
    ok: true,
    package_release: existingPackageRelease,
  })
})
