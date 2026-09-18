import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    chip_name: z.string().optional(),
    is_popular: z.coerce.boolean().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),
  jsonResponse: z.object({
    next_offset: z.number().nullable(),
    datasheets: z.array(
      z.object({
        datasheet_id: z.string().uuid(),
        chip_name: z.string(),
      }),
    ),
  }),
})(async (req, ctx) => {
  const { chip_name, is_popular, limit, offset } = req.commonParams
  const datasheets = ctx.db
    .listDatasheets({ chip_name, is_popular })
    .map((ds) => ({
      datasheet_id: ds.datasheet_id,
      chip_name: ds.chip_name,
    }))

  datasheets.sort((a, b) =>
    a.chip_name < b.chip_name
      ? -1
      : a.chip_name > b.chip_name
        ? 1
        : a.datasheet_id.localeCompare(b.datasheet_id),
  )
  return ctx.json({
    datasheets: datasheets.slice(offset, offset + limit),
    next_offset: offset + limit < datasheets.length ? offset + limit : null,
  })
})
