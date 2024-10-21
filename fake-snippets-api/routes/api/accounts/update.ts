import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { accountSchema, shippingInfoSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    shippingInfo: shippingInfoSchema,
  }),
  jsonResponse: z.object({
    account: accountSchema,
  }),
})(async (req, ctx) => {
  const { shippingInfo } = req.jsonBody

  const updatedAccount = ctx.db.updateAccount(ctx.auth.account_id, {
    shippingInfo,
  })

  if (!updatedAccount) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  return ctx.json({ account: updatedAccount })
})
