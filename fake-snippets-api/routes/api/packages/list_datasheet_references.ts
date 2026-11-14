import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({ package_id: z.string() }),
  jsonResponse: z.object({
    datasheet_references: z.array(z.object({ chip_name: z.string() })),
  }),
})(async (req, ctx) => {
  const pkg = ctx.db.getPackageById(req.query.package_id)
  if (
    !pkg ||
    (pkg.creator_account_id !== ctx.auth.account_id &&
      !ctx.db
        .getState()
        .orgAccounts.some(
          (oa) =>
            oa.account_id === ctx.auth.account_id &&
            oa.org_id === pkg.owner_org_id,
        ))
  ) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }
  return ctx.json({
    datasheet_references: (pkg.reference_design_chip_names ?? []).map(
      (chip_name) => ({ chip_name }),
    ),
  })
})
