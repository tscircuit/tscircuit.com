import { datasheetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export const processAllDatasheets = (ctx: any) => {
  const processed = [] as z.infer<typeof datasheetSchema>[]
  ctx.db.datasheets.forEach((ds: any) => {
    if (!ds.pin_information || !ds.datasheet_pdf_urls || !ds.description) {
      const updated = ctx.db.updateDatasheet(ds.datasheet_id, {
        pin_information: [
          {
            pin_number: "1",
            name: ["PIN1"],
            description: "Placeholder pin",
            capabilities: ["digital"],
          },
        ],
        datasheet_pdf_urls: ["https://example.com/datasheet.pdf"],
        description: "Placeholder description",
        summary: "Placeholder summary",
        chip_type: "other",
        footprint_information: {
          package_type: "SOP",
          dimensions: {
            length_mm: 10,
            width_mm: 5,
            height_mm: 2,
          },
          pin_count: 8,
          pin_spacing_mm: 1.27,
          package_material: "plastic",
          mounting_type: "surface_mount",
        },
        metadata: {
          manufacturer: "Example Corp",
          part_number: "EXAMPLE-001",
        },
        extracted_information: {
          chip_type: "other",
          footprint_information: {
            package_type: "SOP",
            dimensions: {
              length_mm: 10,
              width_mm: 5,
              height_mm: 2,
            },
            pin_count: 8,
            pin_spacing_mm: 1.27,
            package_material: "plastic",
            mounting_type: "surface_mount",
          },
          pin_information: [
            {
              pin_number: "1",
              name: ["PIN1"],
              description: "Placeholder pin",
              capabilities: ["digital"],
            },
          ],
          summary: "Placeholder summary",
          description: "Placeholder description",
          metadata: {
            manufacturer: "Example Corp",
            part_number: "EXAMPLE-001",
          },
          extraction_metadata: {
            chip_type_confidence_score: 0.8,
            raw_detected_chip_type: "other",
          },
        },
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
