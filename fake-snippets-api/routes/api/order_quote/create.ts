import {
    orderQuoteSchema,
} from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { convertCircuitJsonToBomRows } from "circuit-json-to-bom-csv"

export default withRouteSpec({
    methods: ["POST"],
    auth: "session",
    jsonBody: z
        .object({
            package_release_id: z.string().optional(),
            circuit_json: z.array(z.record(z.any())),
        })
        .refine((data) => data.package_release_id || data.circuit_json, {
            message: "Either package_release_id or circuit_json must be provided",
        }),
    jsonResponse: z.object({
        order_quote: orderQuoteSchema,
    }),
})(async (req, ctx) => {
    const { circuit_json, package_release_id } = req.jsonBody


    const bomRows = await convertCircuitJsonToBomRows({ circuitJson: circuit_json as any })

    const orderQuote = ctx.db.addOrderQuote({
        account_id: ctx.auth.account_id,
        package_release_id: package_release_id ?? null,
        is_completed: false,
        is_processing: true,
        error: null,
        has_error: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        bom_rows: bomRows.toString(),
        components: [],
        pcb_price: 0,
        components_price: 0,
        shipping_price: 0,
        total_price: 0,
    })

    return ctx.json({
        order_quote: orderQuote,
    })
})
