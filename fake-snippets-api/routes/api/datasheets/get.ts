import { datasheetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "session",
  queryParams: z.object({
    datasheet_id: z.string(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    datasheet: datasheetSchema,
  }),
})(async (req, ctx) => {
  const { datasheet_id } = req.query
  const datasheet = ctx.db.getDatasheetById(datasheet_id)
  if (!datasheet) {
    return ctx.error(404, {
      error_code: "datasheet_not_found",
      message: "Datasheet not found",
    })
  }
  return ctx.json({ datasheet })
})
