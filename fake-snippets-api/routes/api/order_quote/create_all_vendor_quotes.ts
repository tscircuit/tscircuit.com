import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string(),
  }),
  jsonResponse: z.object({
    order_quote_ids: z.array(z.string()),
  }),
})(async (req, ctx) => {
  const { package_release_id } = req.jsonBody
  const vendorNames = ["JLCPCB", "PCBFab"]

  let orderQuoteIds = []
  for (const vendorName of vendorNames) {
    const orderQuoteId = ctx.db.addOrderQuote({
      account_id: ctx.auth.account_id,
      package_release_id,
      vendor_name: vendorName,
    })
    orderQuoteIds.push(orderQuoteId)
  }

  return ctx.json({
    order_quote_ids: orderQuoteIds,
  })
})
