import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    order_id: z.string(),
  }),
  jsonResponse: z.object({
    order: orderSchema,
  }),
})(async (req, ctx) => {
  const { order_id } = req.query

  const order = ctx.db.getOrderById(order_id)
  if (!order) {
    return ctx.error(404, {
      error_code: "order_not_found",
      message: "Order not found",
    })
  }

  return ctx.json({
    order,
  })
})
