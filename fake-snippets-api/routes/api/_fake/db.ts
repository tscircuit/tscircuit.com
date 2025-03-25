import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { seed } from "fake-snippets-api/lib/db/seed"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  jsonResponse: z.any(),
})(async (req, ctx) => {
  return ctx.json(ctx.db.getState())
})
