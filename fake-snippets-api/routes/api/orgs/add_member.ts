import { orgUserPermissionsSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    org_id: z.string(),
    account_id: z.string().optional(),
    github_username: z.string().optional(),
    can_read_package: z.boolean().optional().default(true),
    can_manage_package: z.boolean().optional().default(false),
    can_manage_org: z.boolean().optional().default(false),
  }),
  auth: "session",
  jsonResponse: z.object({}),
})(async (req, ctx) => {
  const {
    org_id,
    account_id,
    github_username,
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

  let account = ctx.db.accounts.find((acc) => acc.account_id === account_id)
  if (!account) {
    account = ctx.db.accounts.find(
      (acc) => acc.github_username === github_username,
    )
  }

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  ctx.db.addOrganizationAccount({
    org_id,
    account_id: account.account_id,
    can_read_package,
    can_manage_package,
    can_manage_org,
  })

  return ctx.json({})
})
