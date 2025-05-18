import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderQuoteSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "session",
  commonParams: z.object({
    order_quote_id: z.string(),
  }),
  jsonResponse: z.object({
    order_quote: orderQuoteSchema,
  }),
})(async (req, ctx) => {
  const { order_quote_id } = req.commonParams

  const orderQuote = ctx.db.getOrderQuoteById(order_quote_id)

  if (!orderQuote) {
    return ctx.error(404, {
      error_code: "order_quote_not_found",
      message: "Order quote not found",
    })
  }

  return ctx.json({
    order_quote: orderQuote,
  })
})
