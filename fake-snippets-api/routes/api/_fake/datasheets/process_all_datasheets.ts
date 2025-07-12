import { datasheetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export const processAllDatasheets = (ctx: any) => {
  const processed = [] as z.infer<typeof datasheetSchema>[]
  ctx.db.datasheets.forEach((ds: any) => {
    if (!ds.pin_information || !ds.datasheet_pdf_urls || !ds.ai_description) {
      const updated = ctx.db.updateDatasheet(ds.datasheet_id, {
        pin_information: [
          {
            pin_number: "1",
            name: "PIN1",
            description: "Placeholder pin",
            capabilities: ["digital"],
          },
        ],
        datasheet_pdf_urls: ["https://example.com/datasheet.pdf"],
        ai_description: "Placeholder ai description",
      })
      processed.push(updated!)
    } else {
      processed.push(ds)
    }
  })
  return processed
}

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonResponse: z.object({
    datasheets: datasheetSchema.array(),
  }),
})(async (req, ctx) => {
  const datasheets = processAllDatasheets(ctx)
  return ctx.json({ datasheets })
})
