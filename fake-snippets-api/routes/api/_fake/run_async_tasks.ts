import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { processAllDatasheets } from "./datasheets/process_all_datasheets"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  jsonResponse: z.object({ ok: z.boolean() }),
})(async (req, ctx) => {
  processAllDatasheets(ctx)
  return ctx.json({ ok: true })
})
