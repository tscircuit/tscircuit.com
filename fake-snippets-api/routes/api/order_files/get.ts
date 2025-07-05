import { orderFileSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    order_file_id: z.string(),
  }),
  jsonResponse: z.object({
    order_file: orderFileSchema,
  }),
})(async (req, ctx) => {
  const { order_file_id } = req.query

  const orderFile = ctx.db.getOrderFileById(order_file_id)
  if (!orderFile) {
    return ctx.error(404, {
      error_code: "order_file_not_found",
      message: "Order file not found",
    })
  }

  return ctx.json({
    order_file: orderFile,
  })
})
