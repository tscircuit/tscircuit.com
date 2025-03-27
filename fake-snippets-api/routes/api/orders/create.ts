import { type Order, orderSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      package_release_id: z.string().uuid().optional(),
      circuit_json: z.array(z.record(z.any())),
    })
    .refine((data) => data.package_release_id || data.circuit_json, {
      message: "Either package_release_id or circuit_json must be provided",
    }),
  jsonResponse: z.object({
    order: orderSchema,
  }),
})(async (req, ctx) => {
  const { circuit_json } = req.jsonBody

  const newOrder: Omit<Order, "order_id"> = {
    account_id: ctx.auth.account_id,
    is_running: false,
    is_started: false,
    is_finished: false,
    error: null,
    has_error: false,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    circuit_json,
  }

  const order = ctx.db.addOrder(newOrder)

  return ctx.json({
    order,
  })
})
