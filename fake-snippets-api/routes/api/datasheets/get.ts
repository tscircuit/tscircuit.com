import { datasheetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "session",
  queryParams: z
    .object({
      datasheet_id: z.string().optional(),
      chip_name: z.string().optional(),
    })
    .refine((val) => val.datasheet_id || val.chip_name, {
      message: "datasheet_id or chip_name required",
    }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    datasheet: datasheetSchema,
  }),
})(async (req, ctx) => {
  const { datasheet_id, chip_name } = req.query
  let datasheet
  if (datasheet_id) {
    datasheet = ctx.db.getDatasheetById(datasheet_id)
  } else if (chip_name) {
    datasheet = ctx.db.getDatasheetByChipName(chip_name)
  }
  if (!datasheet) {
    return ctx.error(404, {
      error_code: "datasheet_not_found",
      message: "Datasheet not found",
    })
  }
  return ctx.json({ datasheet })
})
