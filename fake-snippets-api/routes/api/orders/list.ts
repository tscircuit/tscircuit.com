import {
  publicMapOrder,
  publicOrderSchema,
} from "fake-snippets-api/lib/public-mapping/public-map-order"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  jsonResponse: z.object({
    ok: z.boolean(),
    orders: z.array(publicOrderSchema),
  }),
})(async (req, ctx) => {
  const orders = [...ctx.db.orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map(publicMapOrder)

  return ctx.json({
    ok: true,
    orders,
  })
})
