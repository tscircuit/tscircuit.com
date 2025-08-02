import { datasheetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { randomUUID } from "crypto"

export const processAllDatasheets = (ctx: any) => {
  const processed = [] as z.infer<typeof datasheetSchema>[]
  ctx.db.datasheets.forEach((ds: any) => {
    if (!ds.variant || !ds.datasheet_pdf_urls || !ds.ai_description) {
      const updated = ctx.db.updateDatasheet(ds.datasheet_id, {
        variant: {
          datasheet_variant_id: randomUUID(),
          variant_name: "Default",
          package_type: "DIP-8",
          package_description: "8-pin Dual Inline Package",
          pin_information: [
            {
              pin_number: "1",
              name: "PIN1",
              description: "Placeholder pin",
              capabilities: ["digital"],
            },
          ],
          footprint_information: null,
          supplier_part_numbers: null,
          is_default_variant: true,
        },
        available_variants: [
          {
            datasheet_variant_id: randomUUID(),
            variant_name: "Default",
            package_type: "DIP-8",
            package_description: "8-pin Dual Inline Package",
            is_default_variant: true,
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
