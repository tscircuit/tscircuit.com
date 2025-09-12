import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    org_id: z.string(),
    account_id: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({}),
})(async (req, ctx) => {
  const { org_id, account_id } = req.commonParams

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

  const account = ctx.db.accounts.find((acc) => acc.account_id === account_id)

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  const personalOrgId = ctx.db.organizations.find(
    (org) =>
      org.owner_account_id === account.account_id &&
      org.is_personal_org == true,
  )

  if (!personalOrgId) {
    return ctx.error(404, {
      error_code: "personal_org_not_found",
      message: "Could not find the user's personal organization",
    })
  }
  ctx.db.updateAccount(account.account_id, {
    personal_org_id: personalOrgId.org_id,
  })

  return ctx.json({})
})
