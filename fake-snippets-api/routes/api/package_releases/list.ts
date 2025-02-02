import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "optional_session",
  jsonResponse: z.object({
    ok: z.boolean(),
    package_releases: z.array(packageReleaseSchema),
  }),
  jsonBody: z.object({
    package_name: z.string(),
  }),
})(async (req, ctx) => {
  const existingPackage = ctx.db.packages.find(
    (pkg) => req.jsonBody.package_name === pkg.name,
  )
  const packageReleases = ctx.db.packageReleases
  return ctx.json({
    ok: true,
    package_releases: packageReleases.filter(
      (pkg) => pkg.package_id == existingPackage?.package_id,
    ),
  })
})
