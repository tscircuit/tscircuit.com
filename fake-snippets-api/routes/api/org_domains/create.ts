import {
  orgDomainPointsToEnum,
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
    org_id: z.string(),
    fully_qualified_domain_name: z.string(),
    points_to: orgDomainPointsToEnum,
    linked_packages: z
      .array(
        z.object({
          points_to: orgDomainLinkedPackagePointsToEnum,
          package_release_id: z.string(),
        }),
      )
      .optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    org_domain: publicOrgDomainSchema,
  }),
})(async (req, ctx) => {
  const { org_id, fully_qualified_domain_name, points_to, linked_packages } =
    req.jsonBody

  const org = ctx.db.getOrg({ org_id }, ctx.auth)
  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  if (!org.can_manage_org) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You do not have permission to manage this organization",
    })
  }

  const existingDomain = ctx.db.getOrgDomainByFQDN(fully_qualified_domain_name)
  if (existingDomain) {
    return ctx.error(400, {
      error_code: "org_domain_fqdn_exists",
      message: "A domain with this fully qualified domain name already exists",
    })
  }

  for (const linkedPackage of linked_packages ?? []) {
    const packageRelease = ctx.db.getPackageReleaseById(
      linkedPackage.package_release_id,
    )
    if (!packageRelease) {
      return ctx.error(404, {
        error_code: "package_release_not_found",
        message: "Package release not found",
      })
    }
  }

  const orgDomain = ctx.db.addOrgDomain({
    org_id,
    fully_qualified_domain_name,
    points_to,
  })

  const createdLinkedPackages = (linked_packages ?? []).map((linkedPackage) =>
    ctx.db.addOrgDomainLinkedPackage({
      org_domain_id: orgDomain.org_domain_id,
      points_to: linkedPackage.points_to,
      package_release_id: linkedPackage.package_release_id,
    }),
  )

  return ctx.json({
    ok: true,
    org_domain: publicMapOrgDomain(orgDomain, createdLinkedPackages),
  })
})
