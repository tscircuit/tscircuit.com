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
    package: packageSchema
      .extend({
        is_starred: z.boolean(),
        user_permissions: z
          .object({
            can_manage_packages: z.boolean(),
          })
          .optional(),
      })
      .optional(),
  }),
})(async (req, ctx) => {
  const { package_id, name } = req.commonParams
  const auth = "auth" in ctx && ctx.auth ? ctx.auth : null

  const foundPackage =
    (package_id && ctx.db.getPackageById(package_id)) ||
    ctx.db.packages.find((p) => p.name === name)

  if (!foundPackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: `Package not found (searched using ${JSON.stringify(req.commonParams)})`,
    })
  }

  if (
    foundPackage.is_private &&
    auth?.github_username !== foundPackage.owner_github_username
  ) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: `Package not found (searched using ${JSON.stringify(
        req.commonParams,
      )})`,
    })
  }

  return ctx.json({
    ok: true,
    package: {
      ...publicMapPackage(foundPackage),
      is_starred: auth
        ? ctx.db.hasStarred(auth.account_id, foundPackage.package_id)
        : false,
      ...(auth
        ? {
            user_permissions: {
              can_manage_packages:
                foundPackage.owner_org_id === auth.personal_org_id,
            },
          }
        : {}),
    },
  })
})
