import { publicOrgDomainSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrgDomain } from "fake-snippets-api/lib/public-mapping/public-map-org-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  commonParams: z.object({
    org_domain_id: z.string().optional(),
    fully_qualified_domain_name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    org_domain: publicOrgDomainSchema,
  }),
})(async (req, ctx) => {
  const { org_domain_id, fully_qualified_domain_name } = req.commonParams

  if (!org_domain_id && !fully_qualified_domain_name) {
    return ctx.error(400, {
      error_code: "missing_params",
      message:
        "Either org_domain_id or fully_qualified_domain_name must be provided",
    })
  }

  const orgDomain = org_domain_id
    ? ctx.db.getOrgDomainById(org_domain_id)
    : ctx.db.getOrgDomainByFQDN(fully_qualified_domain_name!)

  if (!orgDomain) {
    return ctx.error(404, {
      error_code: "org_domain_not_found",
      message: "Organization domain not found",
    })
  }

  const linkedPackages = ctx.db.listOrgDomainLinkedPackages(
    orgDomain.org_domain_id,
  )

  return ctx.json({
    ok: true,
    org_domain: publicMapOrgDomain(orgDomain, linkedPackages),
  })
})
