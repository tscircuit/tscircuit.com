import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["DELETE"],
  auth: "session",
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const account_id = ctx.auth.account_id

  const account = ctx.db.getAccount(account_id)

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }
  if (ctx.auth.account_id !== account_id) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "You are not authorized to delete this account",
    })
  }
  const deleted = ctx.db.deleteAccount(ctx.auth.account_id)

  if (!deleted) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  return ctx.json({ ok: true })
})
