import {
  jlcpcbOrderStateSchema,
  orderSchema,
} from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    order_id: z.string(),
  }),
  jsonResponse: z.object({
    order: orderSchema,
    orderState: jlcpcbOrderStateSchema,
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

  const orderState = ctx.db.getJlcpcbOrderStatesByOrderId(order_id) || {
    jlcpcb_order_state_id: crypto.randomUUID(),
    order_id,
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
    uploaded_gerber_metadata: null,
    gerber_analysis: null,
    are_gerbers_generated: false,
    current_step: null,
  }

  return ctx.json({
    order,
    orderState,
  })
})
