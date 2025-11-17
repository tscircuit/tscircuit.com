import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import {
  accountSchema,
  tscircuitHandleSchema,
} from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST", "PATCH"],
  auth: "session",
  jsonBody: z.object({
    tscircuit_handle: tscircuitHandleSchema,
  }),
  jsonResponse: z.object({
    account: accountSchema,
  }),
})(async (req, ctx) => {
  const { tscircuit_handle } = req.jsonBody

  const requestedHandle = tscircuit_handle.trim()

  if (!requestedHandle) {
    return ctx.error(400, {
      error_code: "invalid_tscircuit_handle",
      message: "tscircuit_handle cannot be empty",
    })
  }

  const account = ctx.db.getAccount(ctx.auth.account_id)

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  const existingHandleLower = account.tscircuit_handle?.toLowerCase()
  const requestedHandleLower = requestedHandle.toLowerCase()

  if (existingHandleLower === requestedHandleLower) {
    return ctx.json({ account })
  }

  const duplicateAccount = ctx.db
    .getState()
    .accounts.find(
      (a) =>
        a.tscircuit_handle?.toLowerCase() === requestedHandleLower &&
        a.account_id !== ctx.auth.account_id,
    )

  if (duplicateAccount) {
    return ctx.error(400, {
      error_code: "account_tscircuit_handle_already_exists",
      message: "Another account already uses this tscircuit handle",
    })
  }

  const updatedAccount = ctx.db.updateAccount(ctx.auth.account_id, {
    tscircuit_handle: requestedHandle,
  })

  if (!updatedAccount) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }
  if (account.personal_org_id) {
    const personalOrg = ctx.db
      .getState()
      .organizations.find((org) => org.org_id === account.personal_org_id)
    if (personalOrg && personalOrg.is_personal_org) {
      ctx.db.updateOrganization(account.personal_org_id, {
        tscircuit_handle: requestedHandle,
      })
    }
  }

  return ctx.json({ account: updatedAccount })
})
