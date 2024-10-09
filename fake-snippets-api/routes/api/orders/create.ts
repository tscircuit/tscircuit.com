import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    circuit_json: z.record(z.any()),
  }),
  jsonResponse: z.object({
    order: orderSchema,
  }),
})(async (req, ctx) => {
  const { circuit_json } = req.jsonBody

  const newOrder = {
    is_draft: true,
    is_pending_validation_by_fab: false,
    is_pending_review_by_fab: false,
    is_validated_by_fab: false,
    is_approved_by_fab_review: false,
    is_approved_by_orderer: false,
    is_in_production: false,
    is_shipped: false,
    is_cancelled: false,
    should_be_blank_pcb: false,
    should_include_stencil: false,
    jlcpcb_order_params: {},
    circuit_json,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const order = ctx.db.addOrder(newOrder)

  return ctx.json({
    order,
  })
})
