import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderQuoteSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
    methods: ["GET"],
    auth: "session",
    queryParams: z.object({
        package_release_id: z.string().optional(),
    }),
    jsonResponse: z.object({
        order_quote: orderQuoteSchema.optional(),
        error: z.string().optional(),
    }),
})(async (req, ctx) => {
    const { package_release_id } = req.query

    let orderQuote
    if (package_release_id) {
        orderQuote = ctx.db.orderQuotes
            .filter((quote) => quote.package_release_id === package_release_id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    } else {
        orderQuote = ctx.db.orderQuotes
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    }

    if (!orderQuote) {
        return ctx.json({
            error: "Order quote not found",
        }, { status: 404 })
    }

    return ctx.json({
        order_quote: orderQuote,
    })
})
