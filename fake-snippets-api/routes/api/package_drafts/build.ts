import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string().min(1),
    expected_revision: z.number().int().positive(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    build_requested: z.literal(true),
    revision: z.number(),
    package_release_id: z.string(),
    package_build_id: z.string(),
  }),
})(async (req, ctx) => {
  const pkg = ctx.db.packages.find(
    (p) => p.package_id === req.jsonBody.package_id,
  )
  if (!pkg) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }
  if (pkg.creator_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You cannot build this package draft",
    })
  }

  const result = ctx.db.queuePackageDraftBuild(
    pkg.package_id,
    req.jsonBody.expected_revision,
  )
  if (!result) {
    return ctx.error(409, {
      error_code: "revision_conflict",
      message: "The draft revision is missing or has changed.",
    })
  }
  return ctx.json({
    ok: true,
    build_requested: true as const,
    revision: result.draft.revision,
    package_release_id: result.release.package_release_id,
    package_build_id: result.build.package_build_id,
  })
})
