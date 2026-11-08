import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { packageDraftSchema } from "fake-snippets-api/lib/db/schema"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({ package_id: z.string().min(1) }),
  jsonResponse: z.object({
    ok: z.boolean(),
    draft: packageDraftSchema.nullable(),
  }),
})(async (req, ctx) => {
  const pkg = ctx.db.packages.find((p) => p.package_id === req.query.package_id)
  if (!pkg) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }
  if (pkg.creator_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You do not have access to this package draft",
    })
  }
  return ctx.json({
    ok: true,
    draft: ctx.db.packageDrafts.find((d) => d.package_id === pkg.package_id) ?? null,
  })
})
