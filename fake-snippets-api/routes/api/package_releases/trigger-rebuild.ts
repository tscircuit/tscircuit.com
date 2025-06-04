import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackageRelease } from "fake-snippets-api/lib/public-mapping/public-map-package-release"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    package_release_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: packageReleaseSchema,
  }),
})(async (req, ctx) => {
  const { package_release_id } = req.jsonBody

  const updatedPackageRelease = ctx.db.triggerPackageReleaseRebuild(package_release_id)

  if (!updatedPackageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: `Package release not found: ${package_release_id}`,
    })
  }

  return ctx.json({
    ok: true,
    package_release: publicMapPackageRelease(updatedPackageRelease),
  })
}) 