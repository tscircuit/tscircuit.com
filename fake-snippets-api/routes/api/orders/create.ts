import { type Order, orderSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const simulateScenarios = [
  "are_gerbers_generated",
  "are_gerbers_uploaded",
  "is_gerber_analyzed",
  "are_initial_costs_calculated",
  "is_pcb_added_to_cart",
  "is_bom_uploaded",
  "is_pnp_uploaded",
  "is_bom_pnp_analyzed",
  "is_bom_parsing_complete",
  "are_components_available",
  "is_patch_map_generated",
  "is_json_merge_file_created",
  "is_dfm_result_generated",
  "are_files_downloaded",
  "are_product_categories_fetched",
  "are_final_costs_calculated",
  "is_json_merge_file_updated",
  "is_added_to_cart",
] as const

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
