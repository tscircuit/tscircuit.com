import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderQuoteSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
    methods: ["POST"],
    auth: "session",
    jsonBody: z.object({
        order_quote_id: z.string(),
    }),
    jsonResponse: z.object({
        order_quote: orderQuoteSchema.optional(),
        error: z.string().optional(),
    }),
})(async (req, ctx) => {
    const { order_quote_id } = req.jsonBody

    const orderQuote = ctx.db.getOrderQuoteById(order_quote_id)

    if (!orderQuote) {
        return ctx.json({
            error: "Order quote not found",
        }, { status: 404 })
    }

    return ctx.json({
        order_quote: orderQuote,
    })
})