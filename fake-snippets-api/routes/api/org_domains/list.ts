import { publicOrgDomainSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrgDomain } from "fake-snippets-api/lib/public-mapping/public-map-org-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  commonParams: z.object({
    org_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    org_domains: z.array(publicOrgDomainSchema),
  }),
})(async (req, ctx) => {
  const { org_id } = req.commonParams

  const org = ctx.db.getOrg({ org_id }, ctx.auth)
  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  const orgDomains = ctx.db
    .listOrgDomains({ org_id })
    .map((orgDomain) =>
      publicMapOrgDomain(
        orgDomain,
        ctx.db.listOrgDomainLinkedPackages(orgDomain.org_domain_id),
      ),
    )

  return ctx.json({
    ok: true,
    org_domains: orgDomains,
  })
})
