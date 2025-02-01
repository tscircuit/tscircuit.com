import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackage } from "fake-snippets-api/lib/public-mapping/public-map-package"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    package_id: z.string().optional(),
    name: z.string().optional(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    package: packageSchema.optional(),
  }),
})(async (req, ctx) => {
  const { package_id, name } = req.commonParams

  const foundPackage =
    (package_id && ctx.db.getPackageById(package_id)) ||
    ctx.db.packages.find((p) => p.name === name)

  if (!foundPackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: `Package not found (searched using ${JSON.stringify(req.commonParams)})`,
    })
  }

  return ctx.json({
    ok: true,
    package: publicMapPackage(foundPackage),
  })
})
