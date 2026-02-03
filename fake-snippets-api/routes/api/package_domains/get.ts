import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicPackageDomainSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackageDomain } from "fake-snippets-api/lib/public-mapping/public-map-package-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    package_domain_id: z.string().optional(),
    fully_qualified_domain_name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_domain: publicPackageDomainSchema,
  }),
})(async (req, ctx) => {
  const { package_domain_id, fully_qualified_domain_name } = req.commonParams

  if (!package_domain_id && !fully_qualified_domain_name) {
    return ctx.error(400, {
      error_code: "missing_parameter",
      message:
        "Either package_domain_id or fully_qualified_domain_name must be provided",
    })
  }

  let packageDomain

  if (package_domain_id) {
    packageDomain = ctx.db.getPackageDomainById(package_domain_id)
  } else if (fully_qualified_domain_name) {
    packageDomain = ctx.db.getPackageDomainByFQDN(fully_qualified_domain_name)
  }

  if (!packageDomain) {
    return ctx.error(404, {
      error_code: "package_domain_not_found",
      message: "Package domain not found",
    })
  }

  return ctx.json({
    ok: true,
    package_domain: publicMapPackageDomain(packageDomain),
  })
})
