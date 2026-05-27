import {
  publicMapOrder,
  publicOrderSchema,
} from "fake-snippets-api/lib/public-mapping/public-map-order"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    account_id: z.string(),
    limit: z.coerce.number().int().min(1).max(100).default(100),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    orders: z.array(publicOrderSchema),
  }),
})(async (req, ctx) => {
  const { account_id, limit } = req.commonParams

  const orders = [...ctx.db.orders]
    .filter((order) => order.account_id === account_id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit)
    .map(publicMapOrder)

  return ctx.json({
    ok: true,
    orders,
  })
})
