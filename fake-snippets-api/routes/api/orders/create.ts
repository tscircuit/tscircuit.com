import {
  JlcpcbOrderState,
  type Order,
  orderSchema,
} from "fake-snippets-api/lib/db/schema"
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

  const newOrder = {
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

  const newJlcpcbOrderState = {
    order_id: order.order_id,
    created_at: new Date().toISOString(),
    are_gerbers_uploaded: false,
    is_gerber_analyzed: false,
    are_initial_costs_calculated: false,
    is_pcb_added_to_cart: false,
    is_bom_uploaded: false,
    is_pnp_uploaded: false,
    is_bom_pnp_analyzed: false,
    is_bom_parsing_complete: false,
    are_components_available: false,
    is_patch_map_generated: false,
    is_json_merge_file_created: false,
    is_dfm_result_generated: false,
    are_files_downloaded: false,
    are_product_categories_fetched: false,
    are_final_costs_calculated: false,
    is_json_merge_file_updated: false,
    is_added_to_cart: false,
    are_gerbers_generated: false,
    current_step: null,
  }

  ctx.db.addJlcpcbOrderState(newJlcpcbOrderState)

  return ctx.json({
    order,
  })
})
