import { publicOrgDomainSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrgDomain } from "fake-snippets-api/lib/public-mapping/public-map-org-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    org_domain_id: z.string(),
    pcm_repository_name: z.string().nullable().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    org_domain: publicOrgDomainSchema,
  }),
})(async (req, ctx) => {
  const { org_domain_id, pcm_repository_name } = req.jsonBody

  const existingDomain = ctx.db.getOrgDomainById(org_domain_id)

  if (!existingDomain) {
    return ctx.error(404, {
      error_code: "org_domain_not_found",
      message: "Organization domain not found",
    })
  }

  const org = ctx.db.getOrg({ org_id: existingDomain.org_id }, ctx.auth)
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

  const updatedDomain = ctx.db.updateOrgDomain(org_domain_id, {
    pcm_repository_name: pcm_repository_name ?? null,
  })

  if (!updatedDomain) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update organization domain",
    })
  }

  return ctx.json({
    ok: true,
    org_domain: publicMapOrgDomain(
      updatedDomain,
      ctx.db.listOrgDomainLinkedPackages(org_domain_id),
    ),
  })
})
