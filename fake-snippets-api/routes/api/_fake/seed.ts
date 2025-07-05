import { seed } from "fake-snippets-api/lib/db/seed"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonResponse: z.object({ ok: z.boolean() }),
})(async (req, ctx) => {
  seed(ctx.db)

  return ctx.json({ ok: true })
})
