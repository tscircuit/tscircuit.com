import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { userPermissionsSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST", "PUT"],
  commonParams: z.object({
    org_id: z.string(),
    account_id: z.string(),
    org_member_permissions: userPermissionsSchema,
  }),
  auth: "session",
  jsonResponse: z.object({}),
})(async (req, ctx) => {
  const { org_id, account_id, org_member_permissions } = req.commonParams

  const org = ctx.db.getOrg({ org_id }, ctx.auth)

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  if (!org.can_manage_org) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "You do not have permission to manage this organization",
    })
  }

  if (account_id === ctx.auth.account_id) {
    return ctx.error(400, {
      error_code: "cannot_update_self",
      message: "You cannot update your own permissions",
    })
  }

  const existingMember = ctx.db.getOrganizationAccount({
    org_id,
    account_id,
  })

  if (!existingMember) {
    return ctx.error(404, {
      error_code: "member_not_found",
      message: "Member not found in this organization",
    })
  }

  ctx.db.updateOrganizationAccount(
    { org_id, account_id },
    org_member_permissions,
  )

  return ctx.json({})
})
