import { datasheetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    chip_name: z.string(),
  }),
  jsonResponse: z.object({
    datasheet: datasheetSchema,
  }),
})(async (req, ctx) => {
  const { chip_name } = req.jsonBody
  const datasheet = ctx.db.addDatasheet({ chip_name })
  return ctx.json({ datasheet })
})
