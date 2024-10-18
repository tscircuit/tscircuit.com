import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["PATCH"],
  auth: "session",
  jsonBody: z.object({
    order_id: z.string(),
    updates: z.object({
      is_draft: z.boolean().optional(),
      is_pending_validation_by_fab: z.boolean().optional(),
      is_pending_review_by_fab: z.boolean().optional(),
      is_validated_by_fab: z.boolean().optional(),
      is_approved_by_fab_review: z.boolean().optional(),
      is_approved_by_orderer: z.boolean().optional(),
      is_in_production: z.boolean().optional(),
      is_shipped: z.boolean().optional(),
      is_cancelled: z.boolean().optional(),
      should_be_blank_pcb: z.boolean().optional(),
      should_include_stencil: z.boolean().optional(),
      jlcpcb_order_params: z.record(z.any()).optional(),
      circuit_json: z.array(z.record(z.any())).optional(),
    }),
  }),
  jsonResponse: z.object({
    order: orderSchema,
  }),
})(async (req, ctx) => {
  const { order_id, updates } = req.jsonBody

  const existingOrder = ctx.db.getOrderById(order_id)
  if (!existingOrder) {
    return ctx.error(404, {
      error_code: "order_not_found",
      message: "Order not found",
    })
  }

  ctx.db.updateOrder(order_id, {
    ...updates,
    updated_at: new Date().toISOString(),
  })

  const updatedOrder = ctx.db.getOrderById(order_id)!

  return ctx.json({
    order: updatedOrder,
  })
})
