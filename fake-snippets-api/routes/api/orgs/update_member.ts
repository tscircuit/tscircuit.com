import { userPermissionsSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST", "PATCH"],
  commonParams: z.object({
    org_id: z.string(),
    account_id: z.string(),
    user_permissions: userPermissionsSchema,
  }),
  auth: "session",
  jsonResponse: z.object({}),
})(async (req, ctx) => {
  const { org_id, account_id, user_permissions } = req.commonParams

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

  const existingMember = ctx.db.getOrganizationAccount({
    org_id,
    account_id,
  })

  if (!existingMember) {
    return ctx.error(404, {
      error_code: "member_not_found",
      message: "Member not found in organization",
    })
  }

  const updates: {
    can_read_package?: boolean
    can_manage_package?: boolean
    can_manage_org?: boolean
  } = {}
  if (user_permissions.can_read_package !== undefined)
    updates.can_read_package = user_permissions.can_read_package
  if (user_permissions.can_manage_package !== undefined)
    updates.can_manage_package = user_permissions.can_manage_package
  if (user_permissions.can_manage_org !== undefined)
    updates.can_manage_org = user_permissions.can_manage_org

  ctx.db.updateOrganizationAccount({ org_id, account_id }, updates)

  return ctx.json({})
})
