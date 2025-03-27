import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderSchema, errorSchema, Order } from "fake-snippets-api/lib/db/schema"

const simulate_scenarios = [
  // TODO: Add more scenarios
  "gerber_generation_failed",
  "gerber_upload_failed",
  "bom_generation_failed",
  "bom_upload_failed",
  "pnp_generation_failed",
  "pnp_upload_failed",
] as const

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string().uuid().optional(),
    circuit_json: z.array(z.record(z.any())),
    _simulate: z.object({
      scenario: z.enum(simulate_scenarios).optional(),
    }).optional(),
  })
    .refine((data) => data.package_release_id || data.circuit_json, {
      message: "Either package_release_id or circuit_json must be provided",
    }),
  jsonResponse: z.object({
    order: orderSchema,
  }),
})(async (req, ctx) => {
  const { circuit_json, package_release_id, _simulate } = req.jsonBody

  const newOrder: Order = {
    order_id: crypto.randomUUID(),
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

  // TODO: Handle more scenarios
  if (_simulate?.scenario === "gerber-generation-failed") {
    newOrder.error = errorSchema.parse({
      error_code: "GERBER_GENERATION_FAILED",
      message: "Gerber generation failed",
    })
    newOrder.has_error = true
  }

  if(newOrder.has_error) {
    return ctx.json({
      order: newOrder,
    })
  }

  const order = ctx.db.addOrder(newOrder)

  return ctx.json({
    order,
  })
})
