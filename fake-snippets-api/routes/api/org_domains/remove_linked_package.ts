import { publicOrgDomainSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrgDomain } from "fake-snippets-api/lib/public-mapping/public-map-org-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    org_domain_id: z.string(),
    org_domain_linked_package_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    org_domain: publicOrgDomainSchema,
  }),
})(async (req, ctx) => {
  const { org_domain_id, org_domain_linked_package_id } = req.jsonBody

  const orgDomain = ctx.db.getOrgDomainById(org_domain_id)
  if (!orgDomain) {
    return ctx.error(404, {
      error_code: "org_domain_not_found",
      message: "Organization domain not found",
    })
  }

  const org = ctx.db.getOrg({ org_id: orgDomain.org_id }, ctx.auth)
  if (!org?.can_manage_org) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You do not have permission to manage this organization",
    })
  }

  const existingLinkedPackage = ctx.db.getOrgDomainLinkedPackageById(
    org_domain_linked_package_id,
  )
  if (!existingLinkedPackage) {
    return ctx.error(404, {
      error_code: "org_domain_linked_package_not_found",
      message: "Organization domain linked package not found",
    })
  }

  if (existingLinkedPackage.org_domain_id !== org_domain_id) {
    return ctx.error(400, {
      error_code: "linked_package_not_in_org_domain",
      message: "Linked package does not belong to this organization domain",
    })
  }

  ctx.db.removeOrgDomainLinkedPackage(org_domain_linked_package_id)

  const linkedPackages = ctx.db.listOrgDomainLinkedPackages(org_domain_id)

  return ctx.json({
    ok: true,
    org_domain: publicMapOrgDomain(orgDomain, linkedPackages),
  })
})
