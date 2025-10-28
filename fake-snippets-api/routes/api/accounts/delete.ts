import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["DELETE"],
  auth: "session",
  jsonResponse: z.object({
    success: z.boolean(),
  }),
})(async (req, ctx) => {
  const deleted = ctx.db.deleteAccount(ctx.auth.account_id)

  if (!deleted) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  return ctx.json({ success: true })
})
