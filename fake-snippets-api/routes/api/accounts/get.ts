import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { accountSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    account: accountSchema,
  }),
})(async (req, ctx) => {
  const account = ctx.db.getAccount(ctx.auth.account_id)
  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  return ctx.json({ account })
})
