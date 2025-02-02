import * as zt from "fake-snippets-api/lib/db/schema"
import { publicMapPackageRelease } from "fake-snippets-api/lib/public-mapping/public-map-package-release"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    package_release_id: z.string().optional(),
    package_name_with_version: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: zt.packageReleaseSchema,
  }),
})(async (req, ctx) => {
  const { package_release_id } = req.jsonBody

  const foundRelease =
    (package_release_id && ctx.db.getPackageReleaseById(package_release_id))

  if (!foundRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  return ctx.json({
    ok: true,
    package_release: publicMapPackageRelease(foundRelease),
  })
})
