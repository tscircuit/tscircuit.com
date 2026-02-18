import {
  orgDomainLinkedPackagePointsToEnum,
  publicOrgDomainSchema,
} from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrgDomain } from "fake-snippets-api/lib/public-mapping/public-map-org-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    org_domain_id: z.string(),
    points_to: orgDomainLinkedPackagePointsToEnum,
    package_release_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    org_domain: publicOrgDomainSchema,
  }),
})(async (req, ctx) => {
  const { org_domain_id, points_to, package_release_id } = req.jsonBody

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

  const packageRelease = ctx.db.getPackageReleaseById(package_release_id)
  if (!packageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  ctx.db.addOrgDomainLinkedPackage({
    org_domain_id,
    points_to,
    package_release_id,
  })

  const linkedPackages = ctx.db.listOrgDomainLinkedPackages(org_domain_id)

  return ctx.json({
    ok: true,
    org_domain: publicMapOrgDomain(orgDomain, linkedPackages),
  })
})
