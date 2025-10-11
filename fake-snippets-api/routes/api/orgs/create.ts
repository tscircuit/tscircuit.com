import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    name: z.string(),
    github_handle: z.string().optional(),
  }),
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const { name, github_handle } = req.commonParams

  const existing = ctx.db.getOrg({ org_name: name })

  if (existing) {
    return ctx.error(400, {
      error_code: "org_already_exists",
      message: "An organization with this name already exists",
    })
  }
  const newOrg = {
    owner_account_id: ctx.auth.account_id,
    name: name,
    created_at: new Date(),
    can_manage_org: true,
    ...(github_handle ? { github_handle } : {}),
  }

  const org = ctx.db.addOrganization(newOrg)

  // Add the creator as a member of the organization
  ctx.db.addOrganizationAccount({
    org_id: org.org_id,
    account_id: ctx.auth.account_id,
    is_owner: true,
  })

  const fullOrg = ctx.db.getOrg({ org_id: org.org_id }, ctx.auth)
  return ctx.json({
    org: publicMapOrg(fullOrg!),
  })
})
