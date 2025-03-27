import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import {
  orderSchema,
  errorSchema,
  Order,
} from "fake-snippets-api/lib/db/schema"

const simulate_scenarios = [
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
      _simulate: z
        .object({
          scenario: z.enum(simulate_scenarios).optional(),
        })
        .optional(),
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

  if (_simulate?.scenario === "are_gerbers_generated") {
    newOrder.error = errorSchema.parse({
      error_code: "GERBER_GENERATION_FAILED",
      message: "Gerber generation failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "are_gerbers_uploaded") {
    newOrder.error = errorSchema.parse({
      error_code: "GERBER_UPLOAD_FAILED",
      message: "Gerber upload failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_gerber_analyzed") {
    newOrder.error = errorSchema.parse({
      error_code: "ANALYZE_GERBER_FAILED",
      message: "Analyze gerber failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_bom_uploaded") {
    newOrder.error = errorSchema.parse({
      error_code: "BOM_UPLOAD_FAILED",
      message: "Bom upload failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_pnp_uploaded") {
    newOrder.error = errorSchema.parse({
      error_code: "PNP_UPLOAD_FAILED",
      message: "Pnp upload failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_bom_pnp_analyzed") {
    newOrder.error = errorSchema.parse({
      error_code: "ANALYZE_BOM_AND_PNP_FAILED",
      message: "Analyze bom and pnp failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_bom_parsing_complete") {
    newOrder.error = errorSchema.parse({
      error_code: "BOM_PARSING_FAILED",
      message: "Bom parsing failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "are_components_available") {
    newOrder.error = errorSchema.parse({
      error_code: "COMPONENTS_AVAILABILITY_FAILED",
      message: "Components availability failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_patch_map_generated") {
    newOrder.error = errorSchema.parse({
      error_code: "GENERATE_PATCH_MAP_FAILED",
      message: "Generate patch map failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_json_merge_file_created") {
    newOrder.error = errorSchema.parse({
      error_code: "CREATION_JSON_MERGE_FILE_FAILED",
      message: "Creation json merge file failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_dfm_result_generated") {
    newOrder.error = errorSchema.parse({
      error_code: "GENERATE_DFM_RESULT_FAILED",
      message: "Generate dfm result failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "are_files_downloaded") {
    newOrder.error = errorSchema.parse({
      error_code: "DOWNLOAD_FILES_FAILED",
      message: "Download files failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "are_product_categories_fetched") {
    newOrder.error = errorSchema.parse({
      error_code: "FETCH_PRODUCT_CATEGORIES_FAILED",
      message: "Fetch product categories failed",
    })
  }

  if (_simulate?.scenario === "are_final_costs_calculated") {
    newOrder.error = errorSchema.parse({
      error_code: "FINAL_COST_CALCULATION_FAILED",
      message: "Final cost calculation failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_json_merge_file_updated") {
    newOrder.error = errorSchema.parse({
      error_code: "UPDATE_JSON_MERGE_FILE_FAILED",
      message: "Update json merge file failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_pcb_added_to_cart") {
    newOrder.error = errorSchema.parse({
      error_code: "ADD_PCB_TO_CART_FAILED",
      message: "Add pcb to cart failed",
    })
    newOrder.has_error = true
  }

  if (_simulate?.scenario === "is_added_to_cart") {
    newOrder.error = errorSchema.parse({
      error_code: "ADD_TO_CART_FAILED",
      message: "Add to cart failed",
    })
    newOrder.has_error = true
  }

  if (newOrder.has_error) {
    return ctx.json({
      order: newOrder,
    })
  }
  const order = ctx.db.addOrder(newOrder)

  return ctx.json({
    order,
  })
})
