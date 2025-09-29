import { orgUserPermissionsSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST", "PATCH"],
  commonParams: z.object({
    org_id: z.string(),
    account_id: z.string(),
    can_read_package: z.boolean().optional(),
    can_manage_package: z.boolean().optional(),
    can_manage_org: z.boolean().optional(),
  }),
  auth: "session",
  jsonResponse: z.object({}),
})(async (req, ctx) => {
  const {
    org_id,
    account_id,
    can_read_package,
    can_manage_package,
    can_manage_org,
  } = req.commonParams

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
  if (can_read_package !== undefined)
    updates.can_read_package = can_read_package
  if (can_manage_package !== undefined)
    updates.can_manage_package = can_manage_package
  if (can_manage_org !== undefined) updates.can_manage_org = can_manage_org

  ctx.db.updateOrganizationAccount({ org_id, account_id }, updates)

  return ctx.json({})
})
