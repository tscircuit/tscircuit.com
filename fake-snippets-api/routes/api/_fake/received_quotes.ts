import { orderQuoteSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    order_quote_id: z.string(),
  }),
  jsonResponse: z.object({
    order_quotes: orderQuoteSchema.array().optional(),
    error: z.string().optional(),
  }),
})(async (req, ctx) => {
  const { order_quote_id } = req.jsonBody

  return ctx.json({
    order_quotes: [
      {
        order_quote_id,
        account_id: "123",
        package_release_id: "123",
        is_completed: true,
        is_processing: false,
        vendor_name: "JLCPCB",
        error: null,
        has_error: false,
        created_at: "2025-04-21",
        updated_at: "2025-04-21",
        completed_at: "2025-04-21",
        quoted_components: [
          {
            manufacturer_part_number: "123",
            supplier_part_number: "123",
            quantity: 1,
            unit_price: 100,
            total_price: 100,
            available: true,
          },
          {
            manufacturer_part_number: "1234",
            supplier_part_number: "1234",
            quantity: 1,
            unit_price: 200,
            total_price: 200,
            available: true,
          },
        ],
        bare_pcb_cost: 300,
        shipping_options: [
          {
            carrier: "DHL",
            service: "Express",
            cost: 100,
          },
          {
            carrier: "FedEx",
            service: "Express",
            cost: 200,
          },
        ],
        total_cost_without_shipping: 100,
      },
      {
        order_quote_id,
        account_id: "123",
        package_release_id: "123",
        is_completed: true,
        is_processing: false,
        vendor_name: "DKRed",
        error: null,
        has_error: false,
        created_at: "2025-04-21",
        updated_at: "2025-04-21",
        completed_at: "2025-04-21",
        quoted_components: [
          {
            manufacturer_part_number: "123",
            supplier_part_number: "123",
            quantity: 1,
            unit_price: 100,
            total_price: 100,
            available: true,
          },
          {
            manufacturer_part_number: "1234",
            supplier_part_number: "1234",
            quantity: 1,
            unit_price: 200,
            total_price: 200,
            available: true,
          },
        ],
        bare_pcb_cost: 300,
        shipping_options: [
          {
            carrier: "DHL",
            service: "Express",
            cost: 100,
          },
          {
            carrier: "FedEx",
            service: "Express",
            cost: 200,
          },
        ],
        total_cost_without_shipping: 100,
      },
    ],
  })
})
