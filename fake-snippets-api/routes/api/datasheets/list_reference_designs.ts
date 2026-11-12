import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "optional_session",
  commonParams: z.object({ chip_name: z.string().trim().min(1).max(255) }),
  jsonResponse: z.object({
    ok: z.boolean(),
    reference_designs: z.array(
      z.object({ name: z.string(), package_release_id: z.string().uuid() }),
    ),
  }),
})(async (_req, ctx) => ctx.json({ ok: true, reference_designs: [] }))
