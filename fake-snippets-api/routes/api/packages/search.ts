import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { packageSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  queryParams: z.object({
    q: z.string(),
  }),
  jsonResponse: z.object({
    packages: z.array(packageSchema),
  }),
})(async (req, ctx) => {
  const { q } = req.query
  const packages = ctx.db.searchPackages(q)
  return ctx.json({ packages })
})
