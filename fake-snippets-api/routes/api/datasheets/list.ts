import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    chip_name: z.string().optional(),
    is_popular: z.boolean().optional(),
  }),
  jsonResponse: z.object({
    datasheets: z.array(
      z.object({
        datasheet_id: z.string().uuid(),
        chip_name: z.string(),
        chip_type: z.string().nullable().optional(),
        summary: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
      }),
    ),
  }),
})(async (req, ctx) => {
  const { chip_name, is_popular } = req.commonParams
  const datasheets = ctx.db
    .listDatasheets({ chip_name, is_popular })
    .map((ds) => ({
      datasheet_id: ds.datasheet_id,
      chip_name: ds.chip_name,
      chip_type: ds.chip_type,
      summary: ds.summary,
      description: ds.description,
    }))

  return ctx.json({ datasheets })
})
