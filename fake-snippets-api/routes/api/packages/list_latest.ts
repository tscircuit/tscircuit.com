import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackage } from "fake-snippets-api/lib/public-mapping/public-map-package"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  queryParams: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
  jsonResponse: z.object({
    packages: z.array(packageSchema),
  }),
})(async (req, ctx) => {
  const limit = req.query.limit || 50

  // Get all packages that are not snippets
  const packages = ctx.db.packages
    .filter((pkg) => !pkg.is_snippet)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit)
    .map((pkg) => publicMapPackage(pkg))

  return ctx.json({ packages })
})
