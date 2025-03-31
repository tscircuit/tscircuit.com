import {
  errorSchema,
  jlcpcbOrderStateSchema,
  orderSchema,
} from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export const simulateScenarios = [
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

const defaultOrderState = {
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
  current_step: null as null | (typeof simulateScenarios)[number],
}

const errorMap = {
  are_gerbers_generated: {
    error_code: "GERBER_GENERATION_FAILED",
    message: "Gerber generation failed",
  },
  are_gerbers_uploaded: {
    error_code: "GERBER_UPLOAD_FAILED",
    message: "Gerber upload failed",
  },
  is_gerber_analyzed: {
    error_code: "ANALYZE_GERBER_FAILED",
    message: "Analyze gerber failed",
  },
  is_bom_uploaded: {
    error_code: "BOM_UPLOAD_FAILED",
    message: "Bom upload failed",
  },
  is_pnp_uploaded: {
    error_code: "PNP_UPLOAD_FAILED",
    message: "Pnp upload failed",
  },
  is_bom_pnp_analyzed: {
    error_code: "ANALYZE_BOM_AND_PNP_FAILED",
    message: "Analyze bom and pnp failed",
  },
  is_bom_parsing_complete: {
    error_code: "BOM_PARSING_FAILED",
    message: "Bom parsing failed",
  },
  are_components_available: {
    error_code: "COMPONENTS_AVAILABILITY_FAILED",
    message: "Components availability failed",
  },
  is_patch_map_generated: {
    error_code: "GENERATE_PATCH_MAP_FAILED",
    message: "Generate patch map failed",
  },
  is_json_merge_file_created: {
    error_code: "CREATION_JSON_MERGE_FILE_FAILED",
    message: "Creation json merge file failed",
  },
  is_dfm_result_generated: {
    error_code: "GENERATE_DFM_RESULT_FAILED",
    message: "Generate dfm result failed",
  },
  are_files_downloaded: {
    error_code: "DOWNLOAD_FILES_FAILED",
    message: "Download files failed",
  },
  are_product_categories_fetched: {
    error_code: "FETCH_PRODUCT_CATEGORIES_FAILED",
    message: "Fetch product categories failed",
  },
  are_final_costs_calculated: {
    error_code: "FINAL_COST_CALCULATION_FAILED",
    message: "Final cost calculation failed",
  },
  is_json_merge_file_updated: {
    error_code: "UPDATE_JSON_MERGE_FILE_FAILED",
    message: "Update json merge file failed",
  },
  is_pcb_added_to_cart: {
    error_code: "ADD_PCB_TO_CART_FAILED",
    message: "Add pcb to cart failed",
  },
  is_added_to_cart: {
    error_code: "ADD_TO_CART_FAILED",
    message: "Add to cart failed",
  },
  are_initial_costs_calculated: {
    error_code: "INITIAL_COST_CALCULATION_FAILED",
    message: "Initial cost calculation failed",
  },
}

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    order_id: z.string(),
    _simulate_scenario: z.enum(simulateScenarios).optional(),
  }),
  jsonResponse: z.object({
    order: orderSchema,
    orderState: jlcpcbOrderStateSchema,
  }),
})(async (req, ctx) => {
  const { order_id, _simulate_scenario } = req.query

  const order = ctx.db.getOrderById(order_id)
  if (!order) {
    return ctx.error(404, {
      error_code: "order_not_found",
      message: "Order not found",
    })
  }

  const updatedOrderState = {
    ...defaultOrderState,
    order_id,
    created_at: new Date().toISOString(),
  }

  if (_simulate_scenario) {
    const error = errorMap[_simulate_scenario]
    if (error) {
      order.error = errorSchema.parse(error)
      order.has_error = true
      ctx.db.updateOrder(order_id, { error: order.error, has_error: true })

      const currentIndex = simulateScenarios.indexOf(_simulate_scenario)
      simulateScenarios.slice(0, currentIndex).forEach((scenario) => {
        updatedOrderState[scenario] = true
      })
      updatedOrderState.current_step = simulateScenarios[currentIndex]
    }
  } else {
    const existingState = ctx.db.getJlcpcbOrderStatesByOrderId(order_id)
    if (existingState) {
      return ctx.json({
        order,
        orderState: existingState,
      })
    }
  }

  ctx.db.updateJlcpcbOrderState(order_id, updatedOrderState)

  const orderState = ctx.db.getJlcpcbOrderStatesByOrderId(order_id)!

  return ctx.json({
    order,
    orderState,
  })
})
