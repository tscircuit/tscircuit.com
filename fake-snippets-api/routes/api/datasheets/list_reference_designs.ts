import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const normalize = (name: string) =>
  name.replace(/[^0-9a-z_-]/gi, "").toLowerCase()

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
})(async (req, ctx) => {
  const chipName = normalize(req.commonParams.chip_name)
  const referenceDesigns = ctx.db.packages.flatMap((pkg) => {
    if (
      !pkg.is_public ||
      pkg.is_private ||
      pkg.is_unlisted ||
      !pkg.last_built_release_id ||
      !pkg.reference_design_chip_names?.some(
        (name) => normalize(name) === chipName,
      )
    ) {
      return []
    }
    return [{ name: pkg.name, package_release_id: pkg.last_built_release_id }]
  })
  return ctx.json({ ok: true, reference_designs: referenceDesigns })
})
