import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    orders: z.array(orderSchema),
  }),
})(async (req, ctx) => {
  return ctx.json({
    orders: ctx.db.orders.filter((o) => o.account_id === ctx.auth.account_id),
  })
})
