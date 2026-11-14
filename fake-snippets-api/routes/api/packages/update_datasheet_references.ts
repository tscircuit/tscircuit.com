import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string(),
    reference_design_chip_names: z
      .array(z.string().trim().min(1).max(255))
      .max(50),
  }),
  jsonResponse: z.object({ ok: z.literal(true) }),
})(async (req, ctx) => {
  const { package_id, reference_design_chip_names } = req.jsonBody
  const pkg = ctx.db.getPackageById(package_id)
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
  ctx.db.updatePackage(package_id, {
    reference_design_chip_names: [
      ...new Set(reference_design_chip_names),
    ].sort(),
    updated_at: new Date().toISOString(),
  })
  return ctx.json({ ok: true })
})
