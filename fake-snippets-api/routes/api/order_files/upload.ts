import { orderFileSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    order_id: z.string(),
    content_base64: z.string(),
    is_gerbers_zip: z.boolean().optional(),
    for_provider: z.string().optional(),
  }),
  jsonResponse: z.object({
    order_file: orderFileSchema,
  }),
})(async (req, ctx) => {
  const { order_id, content_base64, is_gerbers_zip, for_provider } =
    req.jsonBody

  const order = ctx.db.getOrderById(order_id)
  if (!order) {
    return ctx.error(404, {
      error_code: "order_not_found",
      message: "Order not found",
    })
  }

  const newOrderFile = {
    order_id,
    is_gerbers_zip: is_gerbers_zip || false,
    content_type: "base64",
    for_provider: for_provider || null,
    uploaded_at: new Date().toISOString(),
    content_text: Buffer.from(content_base64, "base64").toString("utf-8"),
    content_bytes: Uint8Array.from(atob(content_base64), (c) =>
      c.charCodeAt(0),
    ),
  }

  const orderFile = ctx.db.addOrderFile(newOrderFile)

  return ctx.json({
    order_file: orderFile,
  })
})
